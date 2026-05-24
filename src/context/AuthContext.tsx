import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentBranch: Branch | null;
  users: User[];
  branches: Branch[];
  login: (username: string, pass: string, branchId: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addBranch: (branch: Branch) => void;
  updateBranch: (branch: Branch) => void;
  deleteBranch: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_BRANCHES: Branch[] = [
  { id: '1', name: 'Casa Central' },
  { id: '2', name: 'Shopping' }
];

const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', name: 'Administrador Principal', email: 'admin@visionclara.com', role: 'superadmin', defaultBranchId: '1', password: 'admin', status: 'Activo' }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('optica_branches');
    if (saved) return JSON.parse(saved);
    return INITIAL_BRANCHES;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('optica_users');
    if (saved) return JSON.parse(saved);
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('optica_current_user');
    if (saved) return JSON.parse(saved);
    return null;
  });

  const [currentBranch, setCurrentBranch] = useState<Branch | null>(() => {
    const saved = localStorage.getItem('optica_current_branch');
    if (saved) return JSON.parse(saved);
    return null;
  });

  useEffect(() => {
    localStorage.setItem('optica_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('optica_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('optica_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('optica_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentBranch) {
      localStorage.setItem('optica_current_branch', JSON.stringify(currentBranch));
    } else {
      localStorage.removeItem('optica_current_branch');
    }
  }, [currentBranch]);

  const login = (username: string, pass: string, branchId: string) => {
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
      const branch = branches.find(b => b.id === branchId) || branches[0];
      setCurrentUser(user);
      setCurrentBranch(branch);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentBranch(null);
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addBranch = (branch: Branch) => {
    setBranches(prev => [...prev, branch]);
  };

  const updateBranch = (updatedBranch: Branch) => {
    setBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
    if (currentBranch?.id === updatedBranch.id) {
      setCurrentBranch(updatedBranch);
    }
  };

  const deleteBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
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
