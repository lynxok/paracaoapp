-- =====================================================================
-- ÓPTICA PARACAO — ENDURECIMIENTO DE SEGURIDAD (RLS)        2026-10-08
-- =====================================================================
-- QUÉ HACE
--   1. Guarda una copia de las políticas, permisos y funciones actuales
--      en el esquema "private" (la usa el script de vuelta atrás).
--   2. Quita TODO acceso de "anon" (sin login) a las tablas de la app.
--   3. Deja acceso completo a usuarios logueados (authenticated), igual
--      que hoy. NO filtra por sucursal (eso queda para una etapa 2).
--   4. Protege "profiles": solo un admin cambia roles, sucursal o estado.
--   5. Rehace reset_user_password: solo admins pueden usarla (hoy la
--      puede llamar cualquiera sin login) y arregla el error de gen_salt.
--   6. Crea get_login_branches(): la pantalla de login lee solo id y
--      nombre de sucursales, sin exponer la tabla branches.
--
-- NO TOCA: tablas external_process_form_* (formulario externo),
--          datos de ninguna tabla, auth.users (salvo reset de clave).
--
-- PRERREQUISITOS (si no se cumplen, la app queda en blanco tras login):
--   [ ] Publicada la versión de la app cuyos contextos recargan datos al
--       iniciar sesión y cuyo login usa supabase.rpc('get_login_branches').
--   [ ] Backup hecho (Database → Backups, o export de tablas).
--   [ ] Consulta de usuarios sin perfil devuelve 0 filas (ver abajo).
--   [ ] Horario sin uso (noche / domingo).
--
-- CÓMO APLICAR: pegar completo en Supabase → SQL Editor → Run.
-- Corre en una sola transacción: si algo falla, no se aplica nada.
-- VUELTA ATRÁS: 20261008_02_rollback_rls.sql
--
-- Consulta previa (correr aparte, debe devolver 0 filas):
--   select u.email from auth.users u
--   left join public.profiles p on p.id = u.id where p.id is null;
-- =====================================================================

begin;

create schema if not exists private;
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 0. Lista de tablas de la app (las que no existan se saltean solas)
-- ---------------------------------------------------------------------
create or replace function private.app_tables()
returns text[] language sql immutable as $$
  select array[
    'profiles','clients','inventory','orders','campaigns','doctors','banks',
    'insurances','suppliers','labs','crystal_items','crystal_rules',
    'crystal_treatments','crystal_masters','branches','inventory_categories',
    'system_settings','audit_logs','lab_jobs','lab_payments','transactions',
    'supplier_transactions','prescriptions','billing_drafts','insurance_claims',
    'stock_movements','cheques'
  ]::text[];
$$;

-- ---------------------------------------------------------------------
-- 1. Copia de seguridad del estado actual (solo la primera vez)
-- ---------------------------------------------------------------------
do $$
begin
  if to_regclass('private.bkp_20261008_policies') is null then
    create table private.bkp_20261008_policies as
      select * from pg_policies
      where schemaname = 'public' and tablename = any(private.app_tables());

    create table private.bkp_20261008_grants as
      select table_name, grantee, privilege_type
      from information_schema.role_table_grants
      where table_schema = 'public'
        and table_name = any(private.app_tables())
        and grantee in ('anon','authenticated');

    create table private.bkp_20261008_rls as
      select c.relname as table_name, c.relrowsecurity as rls_enabled
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'
        and c.relname = any(private.app_tables());

    create table private.bkp_20261008_functions as
      select p.oid::regprocedure::text as signature,
             pg_get_functiondef(p.oid)  as definition
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'reset_user_password';
  end if;
end $$;

revoke all on all tables in schema private from anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Helper: ¿el usuario actual es admin?
-- ---------------------------------------------------------------------
create or replace function private.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id::text = auth.uid()::text
      and lower(coalesce(role, '')) in ('superadmin','admin','administrador')
      and coalesce(status, 'Activo') = 'Activo'
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- 3. Tablas de la app: sin anon, acceso completo a authenticated
-- ---------------------------------------------------------------------
do $$
declare
  t text;
  pol record;
begin
  foreach t in array private.app_tables() loop
    if to_regclass('public.' || quote_ident(t)) is null then
      raise notice 'Tabla % no existe, se saltea', t;
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);

    for pol in select policyname from pg_policies
               where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', pol.policyname, t);
    end loop;

    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);

    if t <> 'profiles' then
      execute format(
        'create policy app_authenticated_all on public.%I
           for all to authenticated using (true) with check (true)', t);
    end if;
  end loop;
end $$;

-- Tablas nuevas que se creen en el futuro: sin acceso anon por defecto
alter default privileges in schema public revoke all on tables from anon;

-- ---------------------------------------------------------------------
-- 4. profiles: lectura para logueados; cambios de rol solo admin
-- ---------------------------------------------------------------------
create policy profiles_select on public.profiles
  for select to authenticated using (true);

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (private.is_admin() or id::text = auth.uid()::text);

create policy profiles_update on public.profiles
  for update to authenticated
  using (private.is_admin() or id::text = auth.uid()::text)
  with check (private.is_admin() or id::text = auth.uid()::text);

create policy profiles_delete on public.profiles
  for delete to authenticated using (private.is_admin());

create or replace function private.guard_profile_privileges()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  -- Sin usuario (SQL Editor, service_role, triggers internos): permitir
  if auth.uid() is null then
    return new;
  end if;
  if private.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.role := 'standard';
    return new;
  end if;
  if new.role is distinct from old.role
     or new.default_branch_id is distinct from old.default_branch_id
     or new.status is distinct from old.status then
    raise exception 'Solo un administrador puede cambiar rol, sucursal o estado';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_privileges on public.profiles;
create trigger trg_guard_profile_privileges
  before insert or update on public.profiles
  for each row execute function private.guard_profile_privileges();

-- ---------------------------------------------------------------------
-- 5. reset_user_password: solo admin, con pgcrypto bien referenciado
-- ---------------------------------------------------------------------
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig
           from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname = 'reset_user_password' loop
    execute format('drop function %s', f.sig);
  end loop;
end $$;

create function public.reset_user_password(target_user_id uuid, new_plain_password text)
returns void
language plpgsql security definer
set search_path = public, extensions, auth
as $$
begin
  if not private.is_admin() then
    raise exception 'No autorizado';
  end if;
  if new_plain_password is null or length(trim(new_plain_password)) < 6 then
    raise exception 'La contraseña debe tener al menos 6 caracteres';
  end if;
  update auth.users
     set encrypted_password = extensions.crypt(new_plain_password, extensions.gen_salt('bf')),
         updated_at = now()
   where id = target_user_id;
end;
$$;
revoke all on function public.reset_user_password(uuid, text) from public, anon;
grant execute on function public.reset_user_password(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- 6. Sucursales para la pantalla de login (solo id y nombre)
-- ---------------------------------------------------------------------
create or replace function public.get_login_branches()
returns table (id text, name text)
language sql stable security definer
set search_path = public
as $$
  select b.id::text, b.name::text from public.branches b order by b.id;
$$;
revoke all on function public.get_login_branches() from public;
grant execute on function public.get_login_branches() to anon, authenticated;

commit;

-- ---------------------------------------------------------------------
-- VERIFICACIÓN (correr después):
--   select tablename, policyname, roles, cmd from pg_policies
--   where schemaname = 'public' order by 1;
--   -- Desde la app sin login: clients/transactions deben devolver 0 filas.
--   -- Con login: todo debe verse igual que antes.
-- ---------------------------------------------------------------------
