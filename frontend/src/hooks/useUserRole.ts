import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useApi } from './useApi';

export type UserRole = 'Player' | 'Admin' | 'SuperAdmin';

interface UserRoleState {
  role: UserRole | null;
  isActive: boolean;
  loading: boolean;
}

export function useUserRole(): UserRoleState {
  const { session } = useAuth();
  const api = useApi();
  const [state, setState] = useState<UserRoleState>({ role: null, isActive: true, loading: true });

  useEffect(() => {
    if (!session) {
      setState({ role: null, isActive: true, loading: false });
      return;
    }
    api.get('/api/v1/users/me')
      .then(r => {
        const data = r.data.data;
        setState({ role: data.role as UserRole, isActive: data.isActive, loading: false });
      })
      .catch(() => setState({ role: null, isActive: true, loading: false }));
  }, [session]);

  return state;
}
