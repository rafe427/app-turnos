// src/app/dashboard/page.tsx
'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AuthContext';
import MasterCalendar from '../../components/MasterCalendar';

export default function DashboardPage() {
  const { user } = useContext<any>(AuthContext);
  const router = useRouter();

  // Solo admin puede acceder
  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-3xl font-bold p-6">Calendario Master</h1>
      <MasterCalendar />
    </div>
  );
}
