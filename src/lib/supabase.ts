import { createClient } from '@supabase/supabase-js';

export interface SupabaseConnection {
  id: string;
  name: string;
  url: string;
  anonKey: string;
}

const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zbtxejarbjnibmpechct.supabase.co';
const DEFAULT_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidHhlamFyYmpuaWJtcGVjaGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MjgyMjUsImV4cCI6MjEwMDQwNDIyNX0.XLw0F4s7CIKxr528A7ddL3TcpUV7sXyuDx3tAEMGlsc';

export function getSavedConnections(): SupabaseConnection[] {
  const saved = localStorage.getItem('optica_supabase_connections');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing supabase connections", e);
    }
  }
  return [{ id: 'default', name: 'Óptica Paracao (Principal)', url: DEFAULT_URL, anonKey: DEFAULT_KEY }];
}

export function saveConnections(connections: SupabaseConnection[]) {
  localStorage.setItem('optica_supabase_connections', JSON.stringify(connections));
}

export function getActiveConnectionId(): string {
  return localStorage.getItem('optica_supabase_active_id') || 'default';
}

export function getActiveConnection(): SupabaseConnection {
  const conns = getSavedConnections();
  const activeId = getActiveConnectionId();
  return conns.find(c => c.id === activeId) || conns[0] || { id: 'default', name: 'Óptica Paracao (Principal)', url: DEFAULT_URL, anonKey: DEFAULT_KEY };
}

const activeConn = getActiveConnection();

export const supabase = createClient(activeConn.url, activeConn.anonKey);

export function switchConnection(id: string) {
  localStorage.setItem('optica_supabase_active_id', id);
  // Clear cached user session details to prevent cross-database auth mixups
  localStorage.removeItem('optica_current_user');
  localStorage.removeItem('optica_current_branch');
  window.location.reload();
}

export function createTempClient() {
  const conn = getActiveConnection();
  return createClient(conn.url, conn.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}
