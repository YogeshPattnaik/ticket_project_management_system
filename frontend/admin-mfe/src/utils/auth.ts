export interface User {
  id: string;
  email: string;
  organizationId?: string;
  roles: Array<{
    id: string;
    name: string;
  }>;
}

export const isSuperAdmin = (user: User | null): boolean => {
  if (!user || !user.roles) {
    console.log('isSuperAdmin check failed:', { user, hasRoles: !!user?.roles });
    return false;
  }
  const hasSuperAdmin = user.roles.some((role) => role.name === 'superadmin');
  console.log('isSuperAdmin result:', hasSuperAdmin, 'roles:', user.roles);
  return hasSuperAdmin;
};

export const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    console.log('No user found in localStorage');
    return null;
  }
  try {
    const user = JSON.parse(userStr);
    console.log('User from storage:', user);
    return user;
  } catch (error) {
    console.error('Error parsing user from storage:', error);
    return null;
  }
};

