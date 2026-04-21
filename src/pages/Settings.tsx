import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { User, Shield, LogOut } from 'lucide-react';

export const Settings: React.FC = () => {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', user.id);

    if (error) {
      toast(error.message, 'danger');
    } else {
      await refreshProfile();
      toast('Profile updated successfully', 'success');
    }
    setUpdating(false);
  };

  return (
    <div className="settings-page" style={{ maxWidth: '600px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="title-large">Settings</h1>
        <p className="text-secondary">Manage your account and preferences</p>
      </header>

      <section className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <User size={24} color="var(--accent-gold)" />
          <h2 className="title-medium">Profile Information</h2>
        </div>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="text-small" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="text-small" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              disabled 
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={updating}>
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      <section className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <Shield size={24} color="var(--accent-gold)" />
          <h2 className="title-medium">Privacy & Security</h2>
        </div>
        <p className="text-small" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Your data is encrypted and stored securely in your private DayBloom instance.
        </p>
        <button className="btn-secondary" style={{ width: '100%' }}>Change Password</button>
      </section>

      <section className="card" style={{ border: '1px solid var(--danger)', background: 'rgba(194, 107, 107, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <LogOut size={24} color="var(--danger)" />
          <h2 className="title-medium" style={{ color: 'var(--danger)' }}>Account Actions</h2>
        </div>
        <button 
          onClick={() => signOut()} 
          className="btn-secondary" 
          style={{ width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)' }}
        >
          Log Out
        </button>
      </section>
    </div>
  );
};
