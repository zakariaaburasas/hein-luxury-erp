import React, { useState, useEffect } from 'react';
import { User, Camera, Check } from 'lucide-react';

export default function ProfileView({ currentName, currentAvatar, onSave }) {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(name, avatar);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="border-b border-brand-border pb-6">
        <h2 className="font-serif text-2xl tracking-wide text-txt-main">Identity & Profile</h2>
        <p className="mt-1 text-sm text-txt-muted">Personalize your luxury ERP signature and appearance.</p>
      </header>

      <div className="rounded-[1.5rem] border border-brand-border bg-bg-card p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-2 border-brand-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.15)] bg-bg-main transition-all group-hover:border-brand-gold">
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-brand-gold flex items-center justify-center text-white dark:text-black shadow-lg">
                <Camera size={18} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold ml-1">Full Identity Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="form-control text-lg py-4 px-6" 
                placeholder="Manager or Staff Name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold ml-1">Profile Image URL</label>
              <input 
                type="text" 
                value={avatar} 
                onChange={e => setAvatar(e.target.value)} 
                className="form-control text-sm py-4 px-6 font-mono" 
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-[10px] text-txt-muted mt-2 italic px-1">Tip: You can use any public image link or the default generated portraits.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
             <button 
               type="submit" 
               className={`btn-gold flex-1 py-4 flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-600 border-green-500 text-white' : ''}`}
             >
               {saved ? <><Check size={18} /> Credentials Updated</> : 'Update Profile Signature'}
             </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-brand-border bg-bg-card/50 p-6">
          <p className="text-[10px] text-brand-gold uppercase tracking-widest mb-1">Local Identity</p>
          <p className="text-xs text-txt-muted leading-relaxed italic">Changes made here are stored locally in this browser. Your profile is unique to this workstation.</p>
        </div>
      </div>
    </div>
  );
}
