-- Ejecutar en Supabase: SQL Editor > New query > Run.
-- Cambiá el texto de label por el nombre de la persona a la que enviarás el formulario.
-- La consulta devuelve un token único para crear su enlace personal.

insert into public.external_process_form_invites (label, expires_at)
values ('Relevamiento - Persona externa', now() + interval '30 days')
returning token, label, expires_at;

-- Armá el enlace agregando el token que devuelve la consulta al final de la URL:
-- https://TU-DOMINIO/formularios/Formulario_Configuraciones_Proceso.html?token=PEGAR_TOKEN_AQUI
--
-- Para invalidar un enlace luego de usarlo:
-- update public.external_process_form_invites
-- set active = false
-- where token = 'PEGAR_TOKEN_AQUI';

