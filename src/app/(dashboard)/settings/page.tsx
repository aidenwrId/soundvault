'use client';
import React, { useState, useEffect, useRef } from 'react';
import { User, Save, Loader2, ExternalLink, Image as ImageIcon, Link as LinkIcon, Code, Layout, Plus, Trash2 } from 'lucide-react';
import StorageUsageBar from '@/components/ui/StorageUsageBar';
import type { Profile } from '@/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bio, setBio] = useState('');
  const [socials, setSocials] = useState<{ platform: string; url: string }[]>([]);
  const [customCss, setCustomCss] = useState('');
  const [customLayout, setCustomLayout] = useState('{profile}\n{showcase-tracks}');
  
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'customization' | 'advanced'>('general');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/profile');
      if (res.ok) { 
        const data = await res.json(); 
        setProfile(data.profile); 
        setUsername(data.profile.username || ''); 
        setDisplayName(data.profile.display_name || ''); 
        setAvatarUrl(data.profile.avatar_url || '');
        setBannerUrl(data.profile.banner_url || '');
        setBio(data.profile.bio || '');
        setSocials(data.profile.socials || []);
        setCustomCss(data.profile.custom_css || '');
        setCustomLayout(data.profile.custom_layout || '{profile}\n{showcase-tracks}');
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setMessage('');
    const res = await fetch('/api/profile', { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        username, displayName, avatarUrl, bannerUrl, bio, socials, customCss, customLayout 
      }) 
    });
    if (res.ok) { const data = await res.json(); setProfile(data.profile); setMessage('Settings saved!'); }
    else { const data = await res.json(); setMessage(data.error || 'Failed to save'); }
    setSaving(false); setTimeout(() => setMessage(''), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Must be an image');

    const setUploading = type === 'avatar' ? setUploadingAvatar : setUploadingBanner;
    const setUrl = type === 'avatar' ? setAvatarUrl : setBannerUrl;

    setUploading(true);
    try {
      const signRes = await fetch('/api/uploads/sign', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'cover', fileName: file.name, contentType: file.type, fileSize: file.size })
      });
      if (!signRes.ok) throw new Error('Failed to sign upload');
      const { uploadUrl, r2Key } = await signRes.json();

      const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!uploadRes.ok) throw new Error('Failed to upload image');
      
      setUrl(r2Key);
      
      // Auto-save image
      await fetch('/api/profile', { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(type === 'avatar' ? { avatarUrl: r2Key } : { bannerUrl: r2Key }) 
      });
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-accent-blue animate-spin" /></div>;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-20 bg-vault-950/90 backdrop-blur-md border-b border-vault-800/40">
        <div className="px-6 py-4"><h1 className="text-xl font-bold text-vault-50">Settings</h1></div>
      </div>
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Tabs */}
        <div className="flex border-b border-vault-800">
          <button onClick={() => setActiveTab('general')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-accent-blue text-accent-blue' : 'border-transparent text-vault-400 hover:text-vault-200'}`}>General</button>
          <button onClick={() => setActiveTab('customization')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'customization' ? 'border-accent-blue text-accent-blue' : 'border-transparent text-vault-400 hover:text-vault-200'}`}>Customization</button>
          <button onClick={() => setActiveTab('advanced')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'advanced' ? 'border-accent-blue text-accent-blue' : 'border-transparent text-vault-400 hover:text-vault-200'}`}>Advanced</button>
        </div>

        {activeTab === 'general' && (
          <>
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-vault-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-accent-blue" />Profile
                </div>
                {profile?.username && (
                  <a href={`/${profile.username}`} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-800 hover:bg-vault-700 text-xs text-vault-300 hover:text-vault-100 transition-colors">
                    View Public Profile <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </h2>
              <div className="flex items-center gap-4">
                <div onClick={() => fileInputRef.current?.click()} className="relative w-16 h-16 rounded-full bg-vault-700 flex items-center justify-center overflow-hidden cursor-pointer group">
                  {avatarUrl ? <img src={`/api/images/${avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-vault-400" />}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    {uploadingAvatar ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <span className="text-[10px] text-white font-medium">Change</span>}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                </div>
                <div><p className="text-sm text-vault-100 font-medium">{profile?.email}</p><p className="text-xs text-vault-400">Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</p></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-sm text-vault-300 font-medium">Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-vault-800 border border-vault-700/50 rounded-xl text-sm text-vault-100 focus:outline-none focus:border-accent-blue/50" /></div>
                <div><label className="text-sm text-vault-300 font-medium">Display Name</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-vault-800 border border-vault-700/50 rounded-xl text-sm text-vault-100 focus:outline-none focus:border-accent-blue/50" /></div>
              </div>
              {message && <p className={`text-sm ${message.includes('saved') ? 'text-accent-green' : 'text-accent-red'}`}>{message}</p>}
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            {profile && (
              <div className="glass-card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-vault-100">Storage</h2>
                <StorageUsageBar used={profile.storage_used_bytes} limit={profile.storage_limit_bytes} />
              </div>
            )}
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-vault-100">Plan</h2>
              <p className="text-sm text-vault-400">You&apos;re on the <span className="text-accent-blue font-medium">Free</span> plan. Upgrade coming soon.</p>
            </div>
          </>
        )}

        {activeTab === 'customization' && (
          <div className="glass-card p-6 space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-vault-100 flex items-center gap-2 mb-4"><ImageIcon className="w-5 h-5 text-accent-blue" />Banner Image</h2>
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className="relative w-full h-32 rounded-xl bg-vault-800 flex items-center justify-center overflow-hidden cursor-pointer group border border-vault-700/50"
              >
                {bannerUrl ? <img src={`/api/images/${bannerUrl}`} alt="Banner" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-vault-500" />}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  {uploadingBanner ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <span className="text-sm text-white font-medium">Change Banner</span>}
                </div>
                <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-vault-100 flex items-center gap-2 mb-2"><User className="w-5 h-5 text-accent-blue" />Bio</h2>
              <textarea 
                value={bio} onChange={(e) => setBio(e.target.value)} 
                placeholder="Tell the world about yourself..."
                className="w-full h-24 px-4 py-3 bg-vault-800 border border-vault-700/50 rounded-xl text-sm text-vault-100 focus:outline-none focus:border-accent-blue/50 resize-none"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-vault-100 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><LinkIcon className="w-5 h-5 text-accent-blue" />Social Links</div>
                <button onClick={() => setSocials([...socials, { platform: 'website', url: '' }])} className="text-xs px-3 py-1.5 bg-vault-800 hover:bg-vault-700 rounded-lg flex items-center gap-1 transition-colors"><Plus className="w-3 h-3" />Add Link</button>
              </h2>
              <div className="space-y-3">
                {socials.map((social, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select 
                      value={social.platform} onChange={(e) => { const newS = [...socials]; newS[i].platform = e.target.value; setSocials(newS); }}
                      className="bg-vault-800 border border-vault-700 rounded-lg px-3 py-2 text-sm text-vault-100 focus:outline-none focus:border-accent-blue"
                    >
                      <option value="website">Website</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="instagram">Instagram</option>
                      <option value="discord">Discord</option>
                      <option value="snapchat">Snapchat</option>
                      <option value="youtube">YouTube</option>
                      <option value="soundcloud">SoundCloud</option>
                      <option value="spotify">Spotify</option>
                    </select>
                    <input 
                      type="text" value={social.url} onChange={(e) => { const newS = [...socials]; newS[i].url = e.target.value; setSocials(newS); }} 
                      placeholder="https://..."
                      className="flex-1 bg-vault-800 border border-vault-700 rounded-lg px-3 py-2 text-sm text-vault-100 focus:outline-none focus:border-accent-blue"
                    />
                    <button onClick={() => { const newS = [...socials]; newS.splice(i, 1); setSocials(newS); }} className="p-2 text-vault-400 hover:text-accent-red transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {socials.length === 0 && <p className="text-sm text-vault-400 text-center py-4 bg-vault-800/30 rounded-xl border border-vault-700/30">No social links added yet.</p>}
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
              <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Customization'}
            </button>
            {message && <p className={`text-sm text-center ${message.includes('saved') ? 'text-accent-green' : 'text-accent-red'}`}>{message}</p>}
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="glass-card p-6 space-y-8">
            <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-xl p-4">
              <p className="text-sm text-accent-amber font-medium">Advanced Customization</p>
              <p className="text-xs text-accent-amber/80 mt-1">These settings allow you to completely overhaul your public profile. CSS is injected safely.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-vault-100 flex items-center gap-2 mb-2"><Layout className="w-5 h-5 text-accent-purple" />Custom Layout</h2>
              <p className="text-xs text-vault-400 mb-3">Available tags: {'{profile}'}, {'{showcase-tracks}'}, {'{socials}'}, {'{bio}'}. Write basic HTML or just stack the tags.</p>
              <textarea 
                value={customLayout} onChange={(e) => setCustomLayout(e.target.value)} 
                placeholder="{profile}\n{bio}\n{socials}\n{showcase-tracks}"
                className="w-full h-32 px-4 py-3 bg-vault-950 font-mono border border-vault-700/50 rounded-xl text-sm text-vault-200 focus:outline-none focus:border-accent-purple/50"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-vault-100 flex items-center gap-2 mb-2"><Code className="w-5 h-5 text-accent-green" />Custom CSS</h2>
              <p className="text-xs text-vault-400 mb-3">Target elements using standard CSS. Your profile is wrapped in <code className="text-vault-300">#custom-profile-root</code>.</p>
              <textarea 
                value={customCss} onChange={(e) => setCustomCss(e.target.value)} 
                placeholder="/* Make your profile pop! */&#10;body { background: #000; }&#10;.track-card { border-radius: 0; }"
                className="w-full h-48 px-4 py-3 bg-vault-950 font-mono border border-vault-700/50 rounded-xl text-sm text-vault-200 focus:outline-none focus:border-accent-green/50"
              />
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
              <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Theme'}
            </button>
            {message && <p className={`text-sm text-center ${message.includes('saved') ? 'text-accent-green' : 'text-accent-red'}`}>{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
