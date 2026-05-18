'use client';
import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface PasswordGateProps { slug: string; onVerified: () => void; }

export default function PasswordGate({ slug, onVerified }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch(`/api/public-share/${slug}/verify-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Incorrect password'); }
      onVerified();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-vault-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-vault-900 border border-vault-700/50 rounded-2xl p-8 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-accent-blue" />
        </div>
        <h1 className="text-xl font-bold text-vault-50 mb-2">Protected Content</h1>
        <p className="text-sm text-vault-400 mb-6">Enter the password to access this content.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full px-4 py-3 bg-vault-800 border border-vault-700/50 rounded-xl text-sm text-vault-100 focus:outline-none focus:border-accent-blue/50" required />
          {error && <p className="text-sm text-accent-red">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? 'Verifying...' : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
