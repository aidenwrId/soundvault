import Link from 'next/link';
import { Music2, Upload, FolderOpen, Share2, Lock, History, Download, ArrowRight, Sparkles } from 'lucide-react';

const features = [
  { icon: Lock, title: 'Private Music Library', desc: 'Your unreleased music stays private. Only you control who has access.' },
  { icon: Share2, title: 'Shareable Links', desc: 'Generate secure links to share tracks or projects with collaborators.' },
  { icon: FolderOpen, title: 'Project Folders', desc: 'Organize your tracks into projects and folders for easy management.' },
  { icon: History, title: 'Version History', desc: 'Keep track of every version and iteration of your songs.' },
  { icon: Download, title: 'Download Controls', desc: 'Choose whether recipients can download your files or just stream.' },
  { icon: Lock, title: 'Password Protection', desc: 'Add passwords to your share links for an extra layer of security.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent-blue/20 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-accent-blue" />
          </div>
          <span className="text-lg font-bold text-vault-50 tracking-tight">SoundVault</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-vault-300 hover:text-vault-100 transition-colors">Login</Link>
          <Link href="/signup" className="px-5 py-2.5 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-accent-blue/20">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-12 pt-20 pb-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-blue/10 border border-accent-blue/20 rounded-full text-xs text-accent-blue-light font-medium mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />Your private music workspace
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-vault-50 leading-tight mb-6 animate-slide-up">
          Upload, organize, and<br />
          <span className="text-gradient">share unreleased music</span>
        </h1>
        <p className="text-lg text-vault-300 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
          A secure vault for your work-in-progress tracks. Organize projects, preview songs with a beautiful player, and share with collaborators — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Link href="/signup" className="flex items-center gap-2 px-7 py-3 bg-accent-blue hover:bg-accent-blue-light text-white font-medium rounded-xl transition-all hover:shadow-xl hover:shadow-accent-blue/25 text-sm">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="px-7 py-3 bg-vault-800/60 hover:bg-vault-700/60 text-vault-200 border border-vault-700/50 font-medium rounded-xl transition-all text-sm">Login</Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-12 pb-28 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-vault-50 mb-3">Everything you need</h2>
          <p className="text-vault-400">Built for artists who take their unreleased music seriously.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-6 group" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-11 h-11 rounded-xl bg-accent-blue/10 flex items-center justify-center mb-4 group-hover:bg-accent-blue/20 transition-colors">
                <f.icon className="w-5 h-5 text-accent-blue" />
              </div>
              <h3 className="text-base font-semibold text-vault-100 mb-2">{f.title}</h3>
              <p className="text-sm text-vault-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-vault-800/40 px-6 lg:px-12 py-8 text-center">
        <p className="text-sm text-vault-500">© {new Date().getFullYear()} SoundVault. Your music, your vault.</p>
      </footer>
    </div>
  );
}
