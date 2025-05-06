// src/app/alumnos/page.tsx
'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AuthContext';
import StudentCalendar from '../../components/StudentCalendar';

export default function AlumnosPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  // Redirigir si no es alumno
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Mi Calendario</h1>
      <StudentCalendar promoId={user.promocionId} username={user.username} />
    </div>
  );
}