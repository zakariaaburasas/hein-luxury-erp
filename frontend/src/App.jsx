import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import API_URL from './api/config';

function App() {
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null, role: null });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  React.useEffect(() => {
    // Initial system setup if needed
    fetch(`${API_URL}/api/auth/setup`, { method: 'POST' }).catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (data.success) {
        setAuth({ 
          isAuthenticated: true, 
          user: data.user.name, 
          role: data.user.role,
          id: data.user.id
        });
      } else {
        setError(data.message || 'Invalid Credentials');
      }
    } catch (err) {
      setError('Connection to HEIN Engine failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4 font-sans selection:bg-brand-gold selection:text-black">
        <div className="w-full max-w-sm rounded-[2rem] border border-brand-border bg-bg-card p-10 md:p-14 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <h1 className="font-serif text-5xl font-bold tracking-[0.2em] text-brand-gold mb-3">HEIN</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">Luxury ERP Engine v2.0</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="text-left space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold ml-1">Identity Access</label>
              <input 
                type="text" 
                required 
                className="form-control bg-bg-main border-brand-border text-white text-base py-4 px-6 rounded-2xl w-full focus:border-brand-gold outline-none transition-all placeholder:text-gray-700" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
            </div>
            <div className="text-left space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-1">Secure Key</label>
              <input 
                type="password" 
                required 
                className="form-control bg-bg-main border-brand-border text-white text-base py-4 px-6 rounded-2xl w-full focus:border-brand-gold outline-none transition-all placeholder:text-gray-700" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              {error && <p className="text-red-500 font-bold text-[10px] uppercase tracking-widest mt-3 bg-red-900/10 p-3 rounded-xl border border-red-500/20 text-center animate-shake">{error}</p>}
            </div>
            <button disabled={isLoggingIn} type="submit" className="btn-gold w-full mt-6 py-4 text-sm font-bold tracking-[0.2em] disabled:opacity-50 shadow-xl shadow-brand-gold/10">
              {isLoggingIn ? 'DECRYPTING...' : 'ACCESS SYSTEM'}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-brand-border/30">
             <p className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-bold">Authorized Personnel Only · 2026 HEIN Corp</p>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard user={auth.user} role={auth.role} userId={auth.id} />;
}

export default App;
