import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import API_URL from './api/config';

function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('hein_auth');
    return saved ? JSON.parse(saved) : { isAuthenticated: false, user: null, role: null, id: null };
  });

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
        const authData = { 
          isAuthenticated: true, 
          user: data.user.name, 
          role: data.user.role,
          id: data.user.id
        };
        setAuth(authData);
        localStorage.setItem('hein_auth', JSON.stringify(authData));
      } else {
        setError(data.message || 'Invalid Credentials');
      }
    } catch (err) {
      setError('Connection to HEIN Engine failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, user: null, role: null, id: null });
    localStorage.removeItem('hein_auth');
    window.location.reload(); // Refresh to ensure clean state
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4 font-sans selection:bg-brand-gold selection:text-black">
        {/* Force dark mode locally for login */}
        <div className="w-full max-w-sm rounded-[2rem] border border-[#222] bg-[#111] p-10 md:p-14 text-center shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl font-bold tracking-[0.2em] text-brand-gold mb-3 drop-shadow-sm">HEIN</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-600">Luxury ERP Engine v2.0</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="text-left space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold ml-1 font-sans">Username</label>
              <input 
                type="text" 
                required 
                className="w-full bg-[#0a0a0a] border border-[#333] text-white text-base py-4 px-6 rounded-2xl focus:border-brand-gold outline-none transition-all placeholder:text-gray-800 font-sans" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
              />
            </div>
            <div className="text-left space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-1 font-sans">Password</label>
              <input 
                type="password" 
                required 
                className="w-full bg-[#0a0a0a] border border-[#333] text-white text-base py-4 px-6 rounded-2xl focus:border-brand-gold outline-none transition-all placeholder:text-gray-800 font-sans" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              {error && <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-4 bg-red-900/10 p-3 rounded-xl border border-red-500/20 text-center animate-shake">{error}</p>}
            </div>
            
            <button disabled={isLoggingIn} type="submit" className="btn-gold w-full mt-6 py-4 text-sm font-bold tracking-[0.3em] disabled:opacity-50 shadow-2xl shadow-brand-gold/10 hover:shadow-brand-gold/20 font-sans">
              {isLoggingIn ? 'DECRYPTING...' : 'ACCESS SYSTEM'}
            </button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-[#222]">
             <p className="text-[9px] uppercase tracking-[0.3em] text-gray-700 font-bold font-sans">Authorized Personnel Only · 2026 HEIN Corp</p>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard user={auth.user} role={auth.role} userId={auth.id} onLogout={handleLogout} />;
}

export default App;
