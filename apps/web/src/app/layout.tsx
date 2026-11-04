import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'SILEX ERP — Industrial Project & Operations Management Platform',
  description: 'ERP industriel spécialisé en tuyauterie, soudage, montage mécanique, maintenance et HVAC pour SILEX SERVICES.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen bg-[#F5F7FA]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
