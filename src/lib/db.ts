import { PostgrestError } from '@supabase/supabase-js';

export interface DbResult<T> {
  data: T | null;
  error: PostgrestError | Error | null;
  success: boolean;
}

/**
 * Envoltorio seguro para llamadas a Supabase.
 * Inspecciona si ocurrió un error, lo registra en consola y opcionalmente ejecuta un callback de rollback.
 */
export async function executeDbOperation<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  contextName = 'Operación de base de datos',
  onRollback?: (err: PostgrestError | Error) => void
): Promise<DbResult<T>> {
  try {
    const { data, error } = await operation();
    if (error) {
      console.error(`[DB Error] ${contextName}:`, error);
      if (onRollback) {
        onRollback(error);
      }
      return { data: null, error, success: false };
    }
    return { data, error: null, success: true };
  } catch (err: any) {
    console.error(`[DB Exception] ${contextName}:`, err);
    if (onRollback) {
      onRollback(err);
    }
    return { data: null, error: err, success: false };
  }
}
