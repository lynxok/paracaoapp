export type UserRole = 'superadmin' | 'admin' | 'Administrador' | 'Vendedor' | 'Laboratorio' | 'standard' | string;

export function hasPermission(role: UserRole = 'standard', path: string): boolean {
  const normalizedRole = (role || '').toLowerCase();

  // Superadmin and Admin have full access
  if (normalizedRole === 'superadmin' || normalizedRole === 'admin' || normalizedRole === 'administrador') {
    return true;
  }

  // Laboratorio role
  if (normalizedRole === 'laboratorio') {
    return path === '/lab-management' || path === '/help' || path === '/status-lookup';
  }

  // Vendedor / Standard role
  if (normalizedRole === 'vendedor' || normalizedRole === 'standard') {
    const restrictedPaths = [
      '/finance',
      '/suppliers',
      '/reports',
      '/marketing',
      '/settings',
      '/billing-drafts'
    ];

    const isRestricted = restrictedPaths.some(p => path === p || path.startsWith(p + '/'));
    return !isRestricted;
  }

  return true;
}
