import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, createTempClient } from '../lib/supabase';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: 'Administrador' | 'Vendedor' | 'Laboratorio' | 'superadmin' | 'admin' | 'standard';
  defaultBranchId: string;
  avatar?: string;
  password?: string;
  status?: string;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  afipCuit?: string;
  afipPtoVenta?: string;
  afipEnv?: 'homologacion' | 'produccion';
  afipCertName?: string;
  afipCertContent?: string;
  afipKeyName?: string;
  afipKeyContent?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentBranch: Branch | null;
  users: User[];
  branches: Branch[];
  login: (usernameOrEmail: string, pass: string, branchId: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  addUser: (user: User) => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addBranch: (branch: Branch) => Promise<void>;
  updateBranch: (branch: Branch) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_BRANCHES: Branch[] = [
  { id: '1', name: 'Casa Central', afipPtoVenta: '0001', afipEnv: 'homologacion' },
  { id: '2', name: 'Shopping', afipPtoVenta: '0002', afipEnv: 'homologacion' }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(INITIAL_BRANCHES[0]);

  // Load session & user profile on mount
  useEffect(() => {
    async function loadSessionAndUsers() {
      // 1. Fetch Users Profile Table
      try {
        const { data: dbUsers, error } = await supabase.from('profiles').select('*');
        if (!error && dbUsers) {
          const mappedUsers: User[] = dbUsers.map(u => ({
            id: u.id,
            username: u.username || u.email?.split('@')[0] || 'usuario',
            name: u.name || u.full_name || 'Usuario',
            email: u.email,
            role: u.role || 'Vendedor',
            defaultBranchId: String(u.default_branch_id || '1'),
            avatar: u.avatar_url,
            status: u.status || 'Activo'
          }));
          setUsers(mappedUsers);
        }
      } catch (e) {
        console.error("Error loading profiles from Supabase:", e);
      }

      // 2. Fetch Branches Table
      try {
        const { data: dbBranches } = await supabase.from('branches').select('*');
        if (dbBranches && dbBranches.length > 0) {
          const mappedBranches: Branch[] = dbBranches.map(b => ({
            id: b.id,
            name: b.name,
            address: b.address,
            phone: b.phone,
            afipCuit: b.afip_cuit,
            afipPtoVenta: b.afip_pto_venta,
            afipEnv: b.afip_env || 'homologacion',
            afipCertName: b.afip_cert_name,
            afipCertContent: b.afip_cert_content,
            afipKeyName: b.afip_key_name,
            afipKeyContent: b.afip_key_content
          }));
          setBranches(mappedBranches);
          setCurrentBranch(mappedBranches[0]);
        }
      } catch (e) {
        console.error("Error loading branches from Supabase:", e);
      }

      // 3. Check current Supabase Auth Session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const email = session.user.email;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const activeUser: User = {
            id: session.user.id,
            username: profile?.username || email?.split('@')[0] || 'usuario',
            name: profile?.name || session.user.user_metadata?.name || 'Administrador',
            email: email,
            role: profile?.role || 'superadmin',
            defaultBranchId: String(profile?.default_branch_id || '1'),
            status: 'Activo'
          };

          setCurrentUser(activeUser);
        }
      } catch (e) {
        console.error("Error fetching Supabase session:", e);
      }
    }

    loadSessionAndUsers();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const email = session.user.email;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setCurrentUser({
          id: session.user.id,
          username: profile?.username || email?.split('@')[0] || 'usuario',
          name: profile?.name || session.user.user_metadata?.name || 'Administrador',
          email: email,
          role: profile?.role || 'superadmin',
          defaultBranchId: String(profile?.default_branch_id || '1'),
          status: 'Activo'
        });
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (usernameOrEmail: string, pass: string, branchId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      let loginEmail = usernameOrEmail.trim();
      if (!loginEmail.includes('@')) {
        const match = users.find(u => u.username.toLowerCase() === loginEmail.toLowerCase());
        if (match && match.email) {
          loginEmail = match.email;
        } else {
          loginEmail = `${loginEmail}@visionclara.com`;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const foundBranch = branches.find(b => b.id === branchId);
      if (foundBranch) {
        setCurrentBranch(foundBranch);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de autenticación' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const addUser = async (newUser: User): Promise<{ success: boolean; error?: string }> => {
    try {
      const email = newUser.email || `${newUser.username}@visionclara.com`;
      const password = newUser.password || '123456';

      const tempClient = createTempClient();
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: newUser.name,
            role: newUser.role,
            username: newUser.username
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      const userId = authData.user?.id || `usr-${Date.now()}`;
      const profileData = {
        id: userId,
        username: newUser.username,
        name: newUser.name,
        email: email,
        role: newUser.role,
        default_branch_id: newUser.defaultBranchId || '1',
        status: 'Activo'
      };

      await supabase.from('profiles').upsert([profileData]);

      setUsers(prev => {
        const exists = prev.some(u => u.id === userId);
        if (exists) return prev.map(u => u.id === userId ? { ...u, ...newUser, id: userId } : u);
        return [...prev, { ...newUser, id: userId, email }];
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Error al agregar usuario" };
    }
  };

  const updateUser = async (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    try {
      await supabase.from('profiles').upsert([{
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        default_branch_id: updatedUser.defaultBranchId,
        status: updatedUser.status || 'Activo'
      }]);
    } catch (e) {
      console.error("Error updating user profile in Supabase:", e);
    }
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    try {
      await supabase.from('profiles').delete().eq('id', id);
    } catch (e) {
      console.error("Error deleting user from Supabase:", e);
    }
  };

  const addBranch = async (branch: Branch) => {
    setBranches(prev => [...prev, branch]);
    try {
      await supabase.from('branches').upsert([{
        id: branch.id,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        afip_cuit: branch.afipCuit,
        afip_pto_venta: branch.afipPtoVenta,
        afip_env: branch.afipEnv,
        afip_cert_name: branch.afipCertName,
        afip_cert_content: branch.afipCertContent,
        afip_key_name: branch.afipKeyName,
        afip_key_content: branch.afipKeyContent
      }]);
    } catch (e) {
      console.error("Error saving branch to Supabase:", e);
    }
  };

  const updateBranch = async (updatedBranch: Branch) => {
    setBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
    try {
      await supabase.from('branches').upsert([{
        id: updatedBranch.id,
        name: updatedBranch.name,
        address: updatedBranch.address,
        phone: updatedBranch.phone,
        afip_cuit: updatedBranch.afipCuit,
        afip_pto_venta: updatedBranch.afipPtoVenta,
        afip_env: updatedBranch.afipEnv,
        afip_cert_name: updatedBranch.afipCertName,
        afip_cert_content: updatedBranch.afipCertContent,
        afip_key_name: updatedBranch.afipKeyName,
        afip_key_content: updatedBranch.afipKeyContent
      }]);
    } catch (e) {
      console.error("Error updating branch in Supabase:", e);
    }
  };

  const deleteBranch = async (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
    try {
      await supabase.from('branches').delete().eq('id', id);
    } catch (e) {
      console.error("Error deleting branch in Supabase:", e);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!currentUser,
      currentUser,
      currentBranch,
      users,
      branches,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      addBranch,
      updateBranch,
      deleteBranch
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

