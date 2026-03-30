import React, { useState, useRef } from 'react';
import { User, Camera, Check, Upload, Mail, Phone, Loader2 } from 'lucide-react';
import API_URL from '../api/config';

export default function ProfileView({ userId, currentName, currentAvatar, currentEmail = '', currentPhone = '', onSave }) {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [email, setEmail] = useState(currentEmail);
  const [phone, setPhone] = useState(currentPhone);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
        alert("Session error: User ID missing. Please re-login.");
        return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar, email, phone })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onSave(updatedUser.name, updatedUser.avatar);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        alert(`Engine Rejected Profile: ${err.message || 'Verification Error'}`);
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      alert(`Network connectivity loss: ${API_URL} is missing or unresponsive.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="border-b border-brand-border pb-6 flex justify-between items-end">
        <div>
          <h2 className="font-serif text-3xl tracking-wide text-txt-main">Profile Settings</h2>
          <p className="mt-1 text-sm text-txt-muted">Refine your signature across the digital luxury ecosystem.</p>
        </div>
        <div className="text-right hidden sm:block">
           <p className="text-[10px] text-brand-gold uppercase tracking-[0.3em] font-bold font-sans">Encrypted Link</p>
           <p className="text-[9px] text-gray-500 font-mono">NODEID: {userId || 'ANONYMOUS'}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Avatar Upload Section */}
        <div className="lg:col-span-1 rounded-[2rem] border border-brand-border bg-bg-card p-8 shadow-2xl flex flex-col items-center">
          <div className="relative group mb-6">
            <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-2 border-brand-gold/30 shadow-[0_0_40px_rgba(212,175,55,0.1)] bg-bg-main transition-all group-hover:border-brand-gold relative">
              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              <div 
                onClick={() => fileInputRef.current.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                 <Upload className="text-white" size={32} />
              </div>
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-brand-gold flex items-center justify-center text-brand-black shadow-lg hover:scale-105 transition-transform"
            >
              <Camera size={20} />
            </button>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload} 
          />
          
          <div className="text-center">
            <p className="text-xs font-bold text-txt-main mb-1 font-sans">Profile Photo</p>
            <p className="text-[10px] text-txt-muted leading-relaxed px-4">Upload a high-resolution device photo for global recognition.</p>
          </div>
        </div>

        {/* Right: Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2rem] border border-brand-border bg-bg-card p-8 md:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-txt-muted font-bold ml-1 font-sans">Full Legal Identity</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                   <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="form-control text-lg py-4 pl-12 pr-6 w-full font-sans" 
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-txt-muted font-bold ml-1 font-sans">Direct Correspondence</label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                     <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="form-control py-3 pl-12 pr-6 w-full font-sans" 
                      placeholder="email@luxury.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-txt-muted font-bold ml-1 font-sans">Secure Line</label>
                  <div className="relative">
                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                     <input 
                      type="text" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      className="form-control py-3 pl-12 pr-6 w-full font-mono" 
                      placeholder="+X XXX XXX XXXX"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-brand-border/50">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`btn-gold w-full py-4 flex items-center justify-center gap-2 transition-all font-bold tracking-widest ${saved ? 'bg-green-600 border-green-500 text-white' : ''} ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? <Loader2 className="animate-spin text-brand-gold" size={20} /> : saved ? <Check size={20} /> : <Check size={20} />}
                  {isSaving ? 'Saving...' : saved ? 'Profile Updated' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-brand-border bg-bg-card/40 p-6 flex gap-4">
               <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0 border border-brand-gold/20">
                  <Upload size={18} />
               </div>
               <div>
                  <p className="text-[10px] text-brand-gold uppercase tracking-widest mb-1 font-bold">Cloud Sync Active</p>
                  <p className="text-[9px] text-txt-muted leading-normal">Your identity is securely stored in our central MongoDB ledger and accessible from any terminal.</p>
               </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
