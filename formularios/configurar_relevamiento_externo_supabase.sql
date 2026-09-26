-- Relevamiento externo de procesos - Óptica Paracao
-- Ejecutar UNA VEZ desde Supabase > SQL Editor con una cuenta administradora.
-- No modifica ninguna tabla ni pantalla existente del sistema.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create table if not exists public.external_process_form_invites (
  token uuid primary key default gen_random_uuid(),
  label text not null,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.external_process_form_submissions (
  id uuid primary key default gen_random_uuid(),
  invite_token uuid not null references public.external_process_form_invites(token),
  respondent_name text not null check (char_length(respondent_name) between 2 and 160),
  respondent_email text,
  payload jsonb not null,
  submitted_at timestamptz not null default now()
);

alter table public.external_process_form_invites enable row level security;
alter table public.external_process_form_submissions enable row level security;

-- Ningún visitante externo puede leer invitaciones ni respuestas.
revoke all on table public.external_process_form_invites from anon, authenticated;
revoke all on table public.external_process_form_submissions from anon, authenticated;
grant insert on table public.external_process_form_submissions to anon, authenticated;

-- Esta función privada solo confirma que el token incluido en el enlace sea válido.
-- No devuelve datos de invitaciones ni de respuestas.
create or replace function private.is_active_process_form_invite(p_token uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.external_process_form_invites invite
    where invite.token = p_token
      and invite.active = true
      and (invite.expires_at is null or invite.expires_at > now())
  );
$$;

revoke all on function private.is_active_process_form_invite(uuid) from public, anon, authenticated;
grant execute on function private.is_active_process_form_invite(uuid) to anon, authenticated;

drop policy if exists "external invite may submit process response" on public.external_process_form_submissions;
create policy "external invite may submit process response"
on public.external_process_form_submissions
for insert
to anon, authenticated
with check (
  (select private.is_active_process_form_invite(invite_token))
);

-- Crear un enlace para cada persona externa. Copiar el token devuelto.
-- insert into public.external_process_form_invites (label, expires_at)
-- values ('Nombre de la persona', now() + interval '30 days')
-- returning token;

-- Las respuestas quedan disponibles para administración en Table Editor:
-- public.external_process_form_submissions
