import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, Lock, User, MapPin, Loader2, Database } from 'lucide-react';
import { getSavedConnections, getActiveConnectionId, switchConnection } from '../lib/supabase';

export function Login() {
  const { login, users, branches } = useAuth();
  const connections = getSavedConnections();
  const activeConnectionId = getActiveConnectionId();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Default to first user's default branch or first branch
  React.useEffect(() => {
    if (!branchId && branches.length > 0) {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId]);

  // When username changes, auto-select their default branch if found
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsername(val);
    const user = users.find(u => u.username === val || u.email === val);
    if (user && user.defaultBranchId) {
      setBranchId(user.defaultBranchId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password || !branchId) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(username, password, branchId);
      if (!res.success) {
        setError(res.error || 'Usuario o contraseña incorrectos.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-500/30">
      {/* Ambient Glows */}
      <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center -mb-20 relative z-20 pointer-events-none">
          <div className="absolute inset-0 bg-white/30 blur-[60px] rounded-full scale-[1.5] -z-10 hidden dark:block"></div>
          <img src={`${window.location.origin}/argoslogo.png`} alt="Argos" className="w-auto h-72 object-contain drop-shadow-2xl" />
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.05] shadow-2xl rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Base de Datos / Proyecto</label>
                <div className="relative">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={activeConnectionId}
                    onChange={(e) => switchConnection(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950 transition-all font-medium appearance-none cursor-pointer"
                  >
                    {connections.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Usuario / Email</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950 transition-all font-medium"
                    placeholder="ej: admin@visionclara.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Sucursal</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950 transition-all font-medium appearance-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Conectando a Supabase...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
        
        <div className="flex flex-col items-center justify-center mt-12 gap-6 text-center text-xs text-slate-400 font-medium">
          <a href="https://www.lnx.com.ar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-xs font-bold uppercase tracking-wider">Desarrollado por</span>
            <img src="/logolynxnaranja.png" alt="LYNX" className="h-14 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
          </a>
          <p>&copy; {new Date().getFullYear()} Argos. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}

