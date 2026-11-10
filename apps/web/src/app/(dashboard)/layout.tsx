'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer automatically when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#07164D] p-4">
        <div className="flex flex-col items-center gap-4 text-white text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#E51A1A]" />
          <div className="text-sm font-semibold tracking-wide">
            SILEX SERVICES ERP — Chargement de la session...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] overflow-x-hidden relative">
      {/* Fixed Sidebar (Desktop fixed position & Mobile sliding drawer) */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Workspace Column with lg:pl-64 offset for the fixed sidebar */}
      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0 max-w-full">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 overflow-y-auto overflow-x-hidden min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
