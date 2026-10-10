-- =====================================================================
-- ÓPTICA PARACAO — VUELTA ATRÁS DEL ENDURECIMIENTO RLS       2026-10-08
-- =====================================================================
-- Usar SOLO si después de aplicar 20261008_01_seguridad_rls.sql algo
-- dejó de funcionar. Restaura exactamente las políticas, permisos,
-- estado de RLS y la función reset_user_password que había antes,
-- leyendo la copia guardada en private.bkp_20261008_*.
--
-- ⚠️ Al correrlo, la base vuelve a quedar ABIERTA a cualquiera sin login
--    (como estaba). Es una medida temporal: corregir y re-aplicar.
--
-- Se mantiene get_login_branches() (la app nueva la usa y no expone nada
-- sensible) y el helper private.is_admin().
--
-- CÓMO APLICAR: pegar completo en Supabase → SQL Editor → Run.
-- =====================================================================

begin;

do $$
begin
  if to_regclass('private.bkp_20261008_policies') is null then
    raise exception 'No existe la copia private.bkp_20261008_*: el script de seguridad nunca se aplicó. No hay nada que revertir.';
  end if;
end $$;

-- 1. Quitar el trigger de profiles
drop trigger if exists trg_guard_profile_privileges on public.profiles;
drop function if exists private.guard_profile_privileges();

-- 2. Borrar las políticas actuales y restaurar las originales
do $$
declare
  t text;
  pol record;
  b record;
  role_list text;
begin
  foreach t in array private.app_tables() loop
    if to_regclass('public.' || quote_ident(t)) is null then
      continue;
    end if;
    for pol in select policyname from pg_policies
               where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', pol.policyname, t);
    end loop;
  end loop;

  for b in select * from private.bkp_20261008_policies loop
    select string_agg(case when r = 'public' then 'public' else quote_ident(r) end, ', ')
      into role_list
      from unnest(b.roles) as r;

    execute format(
      'create policy %I on public.%I as %s for %s to %s%s%s',
      b.policyname, b.tablename, b.permissive, b.cmd, role_list,
      case when b.qual is not null then ' using (' || b.qual || ')' else '' end,
      case when b.with_check is not null then ' with check (' || b.with_check || ')' else '' end
    );
  end loop;
end $$;

-- 3. Restaurar permisos de anon / authenticated
do $$
declare
  t text;
  g record;
begin
  foreach t in array private.app_tables() loop
    if to_regclass('public.' || quote_ident(t)) is not null then
      execute format('revoke all on table public.%I from anon, authenticated', t);
    end if;
  end loop;

  for g in select * from private.bkp_20261008_grants loop
    if to_regclass('public.' || quote_ident(g.table_name)) is not null then
      execute format('grant %s on table public.%I to %I', g.privilege_type, g.table_name, g.grantee);
    end if;
  end loop;
end $$;

alter default privileges in schema public grant all on tables to anon, authenticated;

-- 4. Restaurar el estado de RLS (activado / desactivado) por tabla
do $$
declare r record;
begin
  for r in select * from private.bkp_20261008_rls loop
    if r.rls_enabled then
      execute format('alter table public.%I enable row level security', r.table_name);
    else
      execute format('alter table public.%I disable row level security', r.table_name);
    end if;
  end loop;
end $$;

-- 5. Restaurar la función reset_user_password original
do $$
declare
  f record;
  b record;
begin
  for f in select p.oid::regprocedure as sig
           from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname = 'reset_user_password' loop
    execute format('drop function %s', f.sig);
  end loop;

  for b in select * from private.bkp_20261008_functions loop
    execute b.definition;
  end loop;
end $$;

commit;

-- VERIFICACIÓN:
--   select tablename, policyname, roles, cmd from pg_policies
--   where schemaname = 'public' order by 1;
-- Las copias private.bkp_20261008_* quedan guardadas; no borrarlas.
