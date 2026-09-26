-- Ejecutar una sola vez si ya corriste configurar_relevamiento_externo_supabase.sql.
-- Permite que la política RLS valide el token sin conceder lectura de datos.
grant usage on schema private to anon, authenticated;

