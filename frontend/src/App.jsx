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
      <div className="flex min-h-screen items-center justify-center bg-brand-black p-4">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-brand-border bg-brand-gray p-8 md:p-12 text-center shadow-2xl">
          <div className="text-center animate-pulse mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-[0.2em] text-brand-gold mb-3">HEIN</h1>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-gray-400">Luxury ERP v2.0</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-left space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold">Username</label>
              <input 
                type="text" 
                required 
                className="form-control" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Manager or Staff"
              />
            </div>
            <div className="text-left space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold">Access Code</label>
              <input 
                type="password" 
                required 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              {error && <p className="text-red-500 font-bold text-[10px] uppercase tracking-widest mt-2 bg-red-900/10 p-2 rounded border border-red-500/20 text-center">{error}</p>}
            </div>
            <button disabled={isLoggingIn} type="submit" className="btn-gold w-full mt-4 py-4 text-sm font-bold tracking-[0.2em] disabled:opacity-50">
              {isLoggingIn ? 'ACCESSING...' : 'ACCESS SYSTEM'}
            </button>
          </form>
          <p className="mt-6 text-[9px] uppercase tracking-widest text-gray-500">Authorized Personnel Only</p>
        </div>
      </div>
    );
  }

  return <Dashboard user={auth.user} role={auth.role} userId={auth.id} />;
}

export default App;
