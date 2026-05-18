'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Music2, Mail, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?redirect=/settings` });
    if (error) { setError(error.message); setLoading(false); return; }
    setSent(true); setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6"><div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center"><Music2 className="w-5 h-5 text-accent-blue" /></div><span className="text-xl font-bold text-vault-50">SoundVault</span></Link>
          <h1 className="text-2xl font-bold text-vault-50 mb-2">Reset password</h1>
          <p className="text-sm text-vault-400">We&apos;ll send you a reset link</p>
        </div>
        {sent ? (
          <div className="bg-vault-900/80 border border-accent-green/30 rounded-2xl p-6 text-center backdrop-blur-md">
            <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4"><Mail className="w-6 h-6 text-accent-green" /></div>
            <h2 className="text-lg font-semibold text-vault-50 mb-2">Check your email</h2>
            <p className="text-sm text-vault-400">Reset link sent to <span className="text-vault-200">{email}</span></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-vault-900/80 border border-vault-700/40 rounded-2xl p-6 space-y-4 backdrop-blur-md">
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-500" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full pl-10 pr-4 py-3 bg-vault-800 border border-vault-700/50 rounded-xl text-sm text-vault-100 placeholder:text-vault-500 focus:outline-none focus:border-accent-blue/50" required /></div>
            {error && <p className="text-sm text-accent-red bg-accent-red/10 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Link'}</button>
          </form>
        )}
        <p className="text-center mt-6"><Link href="/login" className="text-sm text-vault-400 hover:text-vault-200 flex items-center justify-center gap-1"><ArrowLeft className="w-3 h-3" />Back to login</Link></p>
      </div>
    </div>
  );
}
