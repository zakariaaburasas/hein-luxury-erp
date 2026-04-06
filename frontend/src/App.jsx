import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import API_URL from './api/config';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';

function App() {
  const [authState, setAuthState] = useState(() => {
    const saved = sessionStorage.getItem('hein_auth');
    return saved ? JSON.parse(saved) : { isAuthenticated: false, user: null, role: null, id: null, photoURL: null };
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // On mount, check if user was previously signed in via Firebase
  useEffect(() => {
    // Force Session-Only persistence (Clears on browser/tab close)
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        fetch(`${API_URL}/api/auth/setup`, { method: 'POST' }).catch(() => {});
      })
      .catch((err) => console.error("Persistence Error:", err));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User was previously signed in — restore session
        await handleFirebaseUser(firebaseUser);
      } else {
        // Check legacy session
        const saved = sessionStorage.getItem('hein_auth');
        if (saved) {
          try { setAuthState(JSON.parse(saved)); } catch {}
        }
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // After Firebase login (Google or Email), register/fetch user from our backend
  const handleFirebaseUser = async (firebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const res = await fetch(`${API_URL}/api/auth/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      if (data.success) {
        const session = {
          isAuthenticated: true,
          user: data.user.name,
          role: data.user.role,
          id: data.user.id,
          photoURL: firebaseUser.photoURL || null,
          email: firebaseUser.email
        };
        setAuthState(session);
        sessionStorage.setItem('hein_auth', JSON.stringify(session));
        setError('');
      } else {
        setError(data.message || 'Access denied. Contact your administrator.');
        await signOut(auth);
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      await signOut(auth);
    }
  };

  // Google Sign-In
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleFirebaseUser(result.user);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Standard Username/Password Sign-In (Your specific DB users)
  const handleStandardLogin = async (e) => {
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
        const session = {
          isAuthenticated: true,
          user: data.user.name,
          role: data.user.role,
          id: data.user.id,
          photoURL: data.user.avatar || null
        };
        setAuthState(session);
        sessionStorage.setItem('hein_auth', JSON.stringify(session));
      } else {
        setError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (authState.id) {
       await fetch(`${API_URL}/api/users/offline/${authState.id}`, { method: 'PUT' }).catch(() => {});
    }
    await signOut(auth).catch(() => {});
    setAuthState({ isAuthenticated: false, user: null, role: null, id: null });
    sessionStorage.removeItem('hein_auth');
    setUsername('');
    setPassword('');
  };

  // Loading screen while checking auth state
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold tracking-[0.3em] text-brand-gold animate-pulse">HEIN</h1>
          <p className="text-[9px] uppercase tracking-[0.4em] text-gray-700 mt-3 font-bold">Initializing...</p>
        </div>
      </div>
    );
  }

  // Login Page
  if (!authState.isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-[#050505] font-sans selection:bg-brand-gold selection:text-black">
        {/* Left decorative panel — hidden on mobile */}
        <div className="hidden lg:flex flex-col justify-between flex-1 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] border-r border-[#1a1a1a] p-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 60%), radial-gradient(circle at 80% 20%, #D4AF37 0%, transparent 40%)'}} />
          <div className="relative z-10">
            <h1 className="font-serif text-5xl lg:text-7xl font-bold tracking-[0.3em] text-brand-gold">HEIN</h1>
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-500 mt-4 font-black">Elevating Men's Fashion</p>
          </div>
          <div className="relative z-10 space-y-10">
            {[
              { title: 'Global Inventory Master', desc: 'Real-time synchronization across all command clusters' },
              { title: 'Premium Point of Sale', desc: 'Secure high-end transaction processing' },
              { title: 'Financial Intelligence', desc: 'Advanced P&L aggregation and operational burn tracking' },
              { title: 'Executive CRM', desc: 'Elite client relationship management' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-5">
                <div className="w-0.5 h-10 bg-brand-gold/30 rounded-full mt-1 shrink-0" />
                <div>
                  <p className="text-white font-bold text-base tracking-wide">{f.title}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="relative z-10 space-y-2 border-t border-white/5 pt-8">
            <p className="text-[9px] uppercase tracking-[0.3em] text-brand-gold font-bold">Zakaria Adam · Founder & CEO</p>
            <p className="text-[8px] uppercase tracking-[0.2em] text-gray-700 font-bold">WeChat: Aburasas · +252 63 4508824</p>
          </div>
        </div>

        {/* Right login panel */}
        <div className="flex flex-1 items-center justify-center p-6 lg:p-16 bg-[#030303]">
          <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-10">
              <h1 className="font-serif text-5xl font-bold tracking-[0.3em] text-brand-gold">HEIN</h1>
              <p className="text-[9px] uppercase tracking-[0.3em] text-gray-600 mt-2 font-bold">Elevating Men's Fashion</p>
            </div>

            <div>
              <h2 className="font-serif text-3xl text-white font-bold">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to access the HEIN system</p>
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-bold py-4 px-6 rounded-2xl transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoggingIn ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[#1f1f1f]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-700 font-bold">or</span>
              <div className="flex-1 h-px bg-[#1f1f1f]" />
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleStandardLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">System Username</label>
                <input
                  type="text" required
                  className="w-full bg-[#0d0d0d] border border-[#222] text-white text-sm py-4 px-5 rounded-2xl focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all placeholder:text-gray-800"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. Zakaria"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Password</label>
                <input
                  type="password" required
                  className="w-full bg-[#0d0d0d] border border-[#222] text-white text-sm py-4 px-5 rounded-2xl focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all placeholder:text-gray-800"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-red-400 text-lg shrink-0">⚠</span>
                  <p className="text-red-400 text-xs font-bold leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn-gold w-full py-4 text-sm font-black tracking-[0.25em] disabled:opacity-50 shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:shadow-[0_0_40px_rgba(212,175,55,0.25)] transition-all"
              >
                {isLoggingIn ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
              </button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-[9px] uppercase tracking-[0.3em] text-gray-800 font-bold">
                Authorized Personnel Only · HEIN Corp
              </p>
              <p className="text-[8px] uppercase tracking-[0.2em] text-gray-900 font-bold opacity-50">
                Support: Zakariaaburasas@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard user={authState.user} role={authState.role} userId={authState.id} photoURL={authState.photoURL} onLogout={handleLogout} />;
}

export default App;
