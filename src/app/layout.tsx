import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { LocalAuthProvider } from '@/lib/local-auth-context';
import { NotificationCenter } from '@/components/common/NotificationCenter';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ADMIN PORTAL ADJIL',
  description: 'Central Administration Platform for ADJIL BNPL Services',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Content Security Policy - Allow connections to Supabase */}
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co; img-src 'self' data: https://*.supabase.co https://*.google-analytics.com; frame-src 'self' https://*.supabase.co;" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LocalAuthProvider>
          <AuthProvider>
            <NotificationCenter />
            {children}
          </AuthProvider>
        </LocalAuthProvider>
      </body>
    </html>
  );
}
