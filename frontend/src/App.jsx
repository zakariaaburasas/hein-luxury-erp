import React, { useState } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="w-full max-w-sm rounded-lg border border-brand-border bg-brand-gray p-12 text-center shadow-2xl">
          <div className="text-center animate-pulse">
            <h1 className="font-serif text-5xl font-bold tracking-[0.2em] text-brand-gold mb-3">HEIN</h1>
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400">Elevating Men's Fashion</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-left space-y-2">
              <label className="block text-xs uppercase tracking-widest text-gray-400">Admin Access Code</label>
              <input type="password" required className="form-control" defaultValue="heinadmin" />
            </div>
            <button type="submit" className="btn-gold w-full mt-4">Enter System</button>
          </form>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

export default App;
