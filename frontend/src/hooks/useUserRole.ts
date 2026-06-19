import { useAuth } from './useAuth';

export type UserRole = 'Player' | 'Admin' | 'SuperAdmin';

interface UserRoleState {
  role: UserRole | null;
  isActive: boolean;
  loading: boolean;
}

export function useUserRole(): UserRoleState {
  const { user, loading } = useAuth();

  if (loading) return { role: null, isActive: true, loading: true };
  if (!user) return { role: null, isActive: true, loading: false };

  return {
    role: user.role as UserRole,
    isActive: user.isActive,
    loading: false,
  };
}
