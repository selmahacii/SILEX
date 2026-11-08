import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'SILEX ERP — Industrial Project & Operations Management Platform',
  description: 'ERP industriel spécialisé en tuyauterie, soudage, montage mécanique, maintenance et HVAC pour SILEX SERVICES.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#07164D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen bg-[#F5F7FA] overflow-x-hidden text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
