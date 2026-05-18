import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SoundVault — Private Music Sharing Platform',
  description: 'Upload, organize, and share your unreleased music. A secure vault for your work-in-progress tracks.',
  keywords: ['music sharing', 'unreleased music', 'private music', 'song library', 'music vault'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
