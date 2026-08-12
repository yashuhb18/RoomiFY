import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/common/QueryProvider';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ROOMIFY — Next-Gen Hostel & PG SaaS Platform',
  description:
    'Lovable & Stripe inspired enterprise hostel management. Zero-trust PostgreSQL RLS, automated SLA breach prediction, roommate compatibility engine, and integrated marketplace.',
  keywords: [
    'Roomify',
    'hostel management',
    'PG software',
    'roommate matching',
    'maintenance tickets',
    'SaaS',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased bg-[#0A0A0A] text-white selection:bg-purple-500/30 selection:text-purple-200 min-h-screen">
        <QueryProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(26, 26, 26, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                color: '#fff',
                borderRadius: '1rem',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
