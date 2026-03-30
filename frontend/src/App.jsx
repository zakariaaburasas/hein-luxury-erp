import React, { useState } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'Admin' && password === 'Aburasas') {
      setIsAuthenticated(true);
    } else {
      setError('Invalid Credentials');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black p-4">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-brand-border bg-brand-gray p-8 md:p-12 text-center shadow-2xl">
          <div className="text-center animate-pulse mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-[0.2em] text-brand-gold mb-3">HEIN</h1>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-gray-400">Luxury ERP v2.0</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-left space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold">Admin Username</label>
              <input 
                type="text" 
                required 
                className="form-control" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
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
            <button type="submit" className="btn-gold w-full mt-4 py-4 text-sm font-bold tracking-[0.2em]">ACCESS SYSTEM</button>
          </form>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

export default App;
