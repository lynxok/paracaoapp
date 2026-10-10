-- ==============================================================================
-- Migración Fase 2: Lógica de Carrito Multiproducto y Ajuste Atómico de Stock
-- Fecha: 2026-10-10
-- Descripción: 
--  1. Agrega columna sale_group_id a la tabla orders para vincular ítems de una misma venta.
--  2. Crea la función RPC adjust_stock para actualización atómica y concurrente de stock.
-- ==============================================================================

-- 1. Agregar columna sale_group_id a orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'orders' 
          AND column_name = 'sale_group_id'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN sale_group_id text;
        CREATE INDEX IF NOT EXISTS idx_orders_sale_group_id ON public.orders(sale_group_id);
    END IF;
END $$;

-- 2. Función RPC para ajuste concurrente y seguro de stock en jsonb
CREATE OR REPLACE FUNCTION public.adjust_stock(
    p_sku text,
    p_branch_id text,
    p_delta integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_stocks jsonb;
    v_branch_key text := p_branch_id::text;
    v_current_qty integer;
    v_new_qty integer;
    v_updated_stocks jsonb;
BEGIN
    -- Bloqueo de fila para evitar condiciones de carrera concurrentes
    SELECT stocks INTO v_current_stocks
    FROM public.inventory
    WHERE sku = p_sku
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto con SKU % no encontrado en inventario', p_sku;
    END IF;

    IF v_current_stocks IS NULL THEN
        v_current_stocks := '{"1": 0, "2": 0}'::jsonb;
    END IF;

    v_current_qty := COALESCE((v_current_stocks ->> v_branch_key)::integer, 0);
    v_new_qty := GREATEST(0, v_current_qty + p_delta);

    v_updated_stocks := jsonb_set(
        v_current_stocks,
        ARRAY[v_branch_key],
        to_jsonb(v_new_qty),
        true
    );

    UPDATE public.inventory
    SET stocks = v_updated_stocks
    WHERE sku = p_sku;

    RETURN v_updated_stocks;
END;
$$;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.adjust_stock(text, text, integer) TO authenticated;
