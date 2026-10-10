# Prompt para Antigravity — Óptica Paracao v2.5.0 (revisión 2026-10-08)

Proyecto: LYNX Óptica Paracao (React 19 + Vite + TypeScript + Tailwind + Supabase), versión actual 2.4.8.
Ruta: `C:\Users\ignac\OneDrive\LYNX\Optica paracao\Optica paracao + contable`
Producción: `opticagestionparacao.lnx.com.ar` (Hostinger, rama `production`). Desarrollo en `main`.

---

## ⚠️ RESTRICCIÓN CRÍTICA: HAY USUARIOS USANDO LA APP EN PRODUCCIÓN

**No se puede romper nada.** Reglas:
- Trabajar en fases. Al terminar cada fase: `npm run lint` sin errores, commit en `main` y **frenar** para que Nacho pruebe.
- **Nunca** ejecutar `npm run deploy`, tocar la rama `production` ni correr SQL en la base de producción por tu cuenta.
- Todo cambio de código de la Fase 1A tiene que funcionar **igual con la base abierta (como hoy) y con la base cerrada**, para poder publicarlo antes del SQL.
- Usuarios actuales (no deben perder acceso): Juan Simon (superadmin), Ignacio Valente (superadmin), Juan Simon (Alt) (superadmin), Alejandra (admin), Pablo (admin), QA (standard), test (admin, posible cuenta de prueba: preguntar a Nacho antes de tocarla).

## Arranque (ahorro de tokens)
1. Leer `wiki/agent_brief.md` y `wiki/active_context.md` del knowledge_vault.
2. Leer `system_optica_paracao.md` **por secciones**. Ante errores: grep en `bugfix_index.md`.
3. Respetar user_preferences: código y variables en inglés, UI en español rioplatense, PowerShell con `;` (nunca `&&`), Ponytail (YAGNI, reutilizar, mínimo código nuevo), montos con `parseCurrency`/`formatMoney`.

## Archivos ya preparados (leerlos antes de empezar la Fase 1)
- `supabase/migrations/20261008_01_seguridad_rls.sql` — endurecimiento de seguridad (probado en Postgres 16 con un esquema que simula Supabase).
- `supabase/migrations/20261008_02_rollback_rls.sql` — vuelta atrás exacta al estado actual.
- No modificar la lógica de esos scripts sin avisar. Si algo de la app no es compatible con ellos, adaptar la app, o proponer el cambio del SQL y explicarlo.

---

## FASE 1A — Código compatible con la base cerrada (publicable YA, sin SQL)

Contexto verificado el 2026-10-08:
- Sin login, con la anon key pública, se leen y modifican todas las tablas (26 clientes, 54 transacciones, 7 perfiles). Causa: el SQL generado en `src/pages/Settings.tsx` (~línea 446) hace `GRANT ALL ... TO anon` y crea políticas `FOR ALL USING (true) WITH CHECK (true)`.
- La RPC `reset_user_password` **la puede ejecutar cualquiera sin login**, y además hoy falla con `function gen_salt(unknown) does not exist`, así que el botón de resetear contraseña en Configuración no funciona.
- La tabla `branches` tiene columnas `afip_key_content` / `afip_cert_content` (la clave privada de AFIP). Hoy están vacías, pero si se cargan quedarían expuestas.

Tareas:
1. **Recargar los datos al iniciar sesión.** `ClientContext`, `FinanceContext`, `InventoryContext`, `LabContext` y `SettingsContext` cargan una sola vez al montar, antes del login, sin depender de la sesión. Con la base cerrada esa carga vuelve vacía y no se repite: la app quedaría en blanco después del login.
   → Hacer que cada contexto cargue cuando hay sesión y vuelva a cargar cuando cambia el usuario (depender de `currentUser` de AuthContext o de `supabase.auth.onAuthStateChange`). Sin sesión no debe cargar nada. Al cerrar sesión, limpiar el estado.
2. **Sucursales del login.** `AuthContext` lee `branches` (con `select('*')`) antes del login para el selector de sucursal. → Usar `supabase.rpc('get_login_branches')` (devuelve `id, name`). Si la RPC todavía no existe (base sin migrar), hacer fallback a la lectura actual para que siga funcionando hoy. Los datos completos de `branches` (incluidos los de AFIP) cargarlos solo después del login.
3. **Lista de usuarios.** `AuthContext` lee `profiles` antes del login. → Cargarla solo después del login.
4. **Rol por defecto.** `AuthContext.tsx` (~líneas 158 y 195) asigna `role: 'superadmin'` cuando no hay perfil. → Usar `'standard'` y mostrar el aviso "Tu usuario no tiene perfil asignado, pedile acceso a un administrador".
5. **Permisos.** `src/lib/permissions.ts`: el `return true` final da acceso total a cualquier rol desconocido. → `return false`. Unificar 'standard' y 'Vendedor' (son el mismo rol; elegir uno y mantener compatibilidad con ambos al leer).
6. **Contraseñas.** `AuthContext.tsx:284`: eliminar la contraseña por defecto `'123456'` y exigir al menos 6 caracteres. Mostrar en la UI el error que devuelve `reset_user_password` (por ejemplo "No autorizado" o la longitud mínima).
7. **Dominio de otro proyecto.** Reemplazar `@visionclara.com` (`AuthContext.tsx:250` y `:283`, `Login.tsx:101`) por una constante de configuración de Paracao, o exigir el email completo.
8. **Generador de SQL.** Actualizar el generador de `Settings.tsx` (~446 y ~930) para que no vuelva a emitir `GRANT ... TO anon` ni políticas `USING (true)` para anon, usando el mismo modelo que `20261008_01_seguridad_rls.sql`.
9. Opcional: `.github/workflows/keep_alive.yml` hace ping a `/rest/v1/`, que hoy responde con error ("Only the service_role API key…"). Cambiarlo a `POST /rest/v1/rpc/get_login_branches`.

Entregable de la fase: lista de qué probar a mano (login de cada rol, ver clientes, venta de prueba, caja, stock, resetear contraseña) **con la base todavía abierta**.

## FASE 1B — Aplicar la seguridad (lo hace Nacho, Antigravity solo asiste)
Checklist para Nacho, en este orden:
1. Fase 1A publicada y probada en producción.
2. Backup de Supabase (Database → Backups o export de tablas).
3. En el SQL Editor, esta consulta debe devolver 0 filas (usuarios sin perfil):
   ```sql
   select u.email from auth.users u
   left join public.profiles p on p.id = u.id where p.id is null;
   ```
4. Decidir qué hacer con la cuenta "test" (admin).
5. En Supabase → Authentication → Sign In / Providers: desactivar "Allow new users to sign up". Los usuarios nuevos se crean desde la app (Configuración → Usuarios). Antes, verificar que ese alta siga funcionando con el registro desactivado; si no, crear los usuarios desde el panel de Supabase y luego el perfil.
6. En horario sin uso: correr `20261008_01_seguridad_rls.sql`.
7. Probar enseguida: login, clientes, venta de prueba, caja, stock, resetear contraseña.
8. Si algo falla: correr `20261008_02_rollback_rls.sql` (restaura todo como estaba), y avisar.

Qué hace el SQL de seguridad:
- Guarda copia del estado actual en `private.bkp_20261008_*`.
- Saca a anon de todas las tablas de la app.
- Los usuarios logueados mantienen acceso completo, como hoy. **No filtra por sucursal**: eso es la Etapa 2.
- En `profiles`, solo un admin cambia rol, sucursal o estado (con un trigger).
- `reset_user_password` queda solo para admins y con `pgcrypto` bien referenciado.
- Crea `get_login_branches()` para la pantalla de login.
- No toca las tablas `external_process_form_*` (formulario externo).

---

## FASE 2 — Lógica (hoy se pierden datos)
1. `CartContext.tsx` checkout (~línea 230): todos los ítems del carrito usan el mismo `orderIdGenerated` y `addOrder` hace `upsert`, así que **en la base queda solo el último ítem**. → ID único por ítem + un `sale_group_id` común para agruparlos. Usar el ID correcto en `addJob` e `insurance_claims`. Si se agrega la columna `sale_group_id`, entregar el SQL aparte (`supabase/migrations/…`) para que lo corra Nacho.
2. **Errores de Supabase ignorados.** supabase-js no lanza excepciones: devuelve `{ error }`. De ~98 `await supabase` solo ~20 revisan el error. → Crear un helper único (`src/lib/db.ts`) que revise `error`, revierta el estado optimista o lo marque como no guardado, y avise con `NotificationsContext`. Aplicarlo en todos los contextos.
3. `InventoryContext.registerMovement`: el ID `mov-${Date.now()}` choca cuando se descuentan armazón y cristal en el mismo milisegundo, y el segundo insert falla sin aviso. → `crypto.randomUUID()`.
4. **Stock.** Se calcula en el navegador y se pisa en la base: dos ventas al mismo tiempo pierden un descuento. `Math.max(0, …)` permite vender sin stock sin avisar. → RPC atómica `adjust_stock(sku, branch_id, delta)` (entregar el SQL aparte) y aviso antes de cobrar sin stock.
5. **Fechas.** `toISOString().split('T')[0]` aparece unas 44 veces y usa UTC: las ventas después de las 21 h quedan con fecha del día siguiente. → Helper `localDateISO()` en `utils.ts` (zona America/Argentina/Buenos_Aires) y reemplazar todos los usos.
6. Los IDs `ORD-` + 6 dígitos de `Date.now()` se repiten cada ~17 min y el `upsert` puede pisar un pedido viejo. → ID único, manteniendo un número legible.
7. `deductStock` tiene fijos "Casa Central"/"Shopping" y la caja usa "Paracáo Av. de las Americas". → Tomar siempre el nombre de `branches`.

## FASE 3 — Pantallas y uso (visto en producción el 2026-10-08)
1. `App.tsx` (líneas 54–66): subtítulos inventados ("2.450 clientes registrados" con 26 reales, "1.240 SKUs en catálogo", "#PED-2023-884", "Caja Principal #01 - 24 Oct 2023"). → Datos reales o sacarlos.
2. `Layout.tsx:115`: el aviso de zoom usa `outerWidth / innerWidth` y da falsos positivos (mostró 235% y 175% con zoom real 100%, por ventana no maximizada o panel lateral). → Eliminarlo o no mostrarlo sin certeza.
3. Montos en tres formatos ("$470.000" en el Panel, "$4,450,571" en Caja, "TOTAL: $99400.00" en Nuevo Pedido). → Usar siempre `formatMoney`.
4. `NewOrder.tsx`: al cargar la graduación se autoselecciona el primer cristal (VITOLEN $99.400). → Arrancar sin cristal y pedir que se elija.
5. Reemplazar los 78 `alert()` y 25 `confirm()` nativos por toasts (`NotificationsContext`) y un `ConfirmDialog` reutilizable. Agregar estados "Guardando…" y de error en los botones de guardar.
6. Caja: marcar en rojo las cajas con saldo negativo ("Caja 2: $-17.250") y evitar que las tarjetas de arriba se corten en pantallas angostas.
7. `Settings.tsx` ~396: eliminar los logs de auditoría falsos que se crean cuando el registro está vacío. `Marketing.tsx:980`: quitar el CUIT de ejemplo.
8. Evitar duplicados por mayúsculas o espacios al crear marcas, cristales o cajas. Hoy existen VITOLEN/vitolen, "organico c/ AR y BB SEBA"/"ORG C/Ar y BB Seba" y "Caja Efectivo"/"CAJA Efectivo". **No borrar datos**: solo listarlos para que decida Nacho. Lo mismo con el posible pedido doble de Belén Benítez (ORD-1810 / ORD-3682).

## FASE 4 — Mantenimiento
1. `scripts/deploy_build.cjs` pisa el `index.html` fuente con el compilado, y el bundle quedó guardado en `main` (commit `11e6543`), así que `npm run dev` puede cargar código viejo. → El `index.html` fuente apunta siempre a `/src/main.tsx`; el compilado vive solo en `dist/` y en `production`. Sacar `assets/` compilados de `main` y agregarlos a `.gitignore`.
2. Vitest con tests mínimos: `parseCurrency`/`formatMoney`, `localDateISO`, descuento y seña del checkout, IDs únicos por ítem y `hasPermission`.
3. `package.json`: renombrar `react-example` a `optica-paracao` y quitar `express`, `pg`, `better-sqlite3` si no se usan (verificar con grep).
4. Opcional: dividir `Settings.tsx` (5.200 líneas) y `NewOrder.tsx` (3.150) sin cambiar comportamiento.

## Etapa 2 (futuro, no hacer ahora)
Filtrar datos por sucursal en RLS (cada vendedor ve solo su sucursal; los admins ven todo). Requiere revisar qué tablas tienen `branch_id` y cómo usa la app el modo "Consolidado".

## Cierre
- Versión 2.5.0 en `package.json`.
- Registrar cada bug en `wiki/bugfix_index.md` (etiquetas `#auth #db #logica #ui #build`) con su nota `bugfix_*` y la causa raíz.
- Actualizar "📌 Estado actual" en `system_optica_paracao.md` y la línea del proyecto en `active_context.md`.
- Entregar a Nacho la lista de qué probar a mano en cada fase.
