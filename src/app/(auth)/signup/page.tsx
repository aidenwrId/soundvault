'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Music2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess(true); setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center"><Music2 className="w-5 h-5 text-accent-blue" /></div>
            <span className="text-xl font-bold text-vault-50">SoundVault</span>
          </Link>
          <h1 className="text-2xl font-bold text-vault-50 mb-2">Create your vault</h1>
          <p className="text-sm text-vault-400">Start uploading and sharing your music</p>
        </div>
        {success ? (
          <div className="bg-vault-900/80 border border-accent-green/30 rounded-2xl p-6 text-center backdrop-blur-md">
            <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4"><Mail className="w-6 h-6 text-accent-green" /></div>
            <h2 className="text-lg font-semibold text-vault-50 mb-2">Check your email</h2>
            <p className="text-sm text-vault-400">We sent a confirmation link to <span className="text-vault-200">{email}</span></p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="bg-vault-900/80 border border-vault-700/40 rounded-2xl p-6 space-y-4 backdrop-blur-md">
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-500" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full pl-10 pr-4 py-3 bg-vault-800 border border-vault-700/50 rounded-xl text-sm text-vault-100 placeholder:text-vault-500 focus:outline-none focus:border-accent-blue/50" required /></div>
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-500" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)" className="w-full pl-10 pr-4 py-3 bg-vault-800 border border-vault-700/50 rounded-xl text-sm text-vault-100 placeholder:text-vault-500 focus:outline-none focus:border-accent-blue/50" required minLength={6} /></div>
            {error && <p className="text-sm text-accent-red bg-accent-red/10 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">{loading ? 'Creating...' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}</button>
          </form>
        )}
        <p className="text-center text-sm text-vault-400 mt-6">Already have an account? <Link href="/login" className="text-accent-blue hover:text-accent-blue-light font-medium">Sign in</Link></p>
      </div>
    </div>
  );
}
