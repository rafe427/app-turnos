// src/app/layout.tsx
'use client';

import '../styles/globals.css';
import Header from '../components/Header';    // ← mayúscula exacta
import { AuthProvider } from '../context/AuthContext';
import { PromotionProvider } from '../context/PromotionContext';
import { StudentProvider } from '../context/StudentContext';
import { SlotProvider } from '../context/SlotContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <PromotionProvider>
            <StudentProvider>
              <SlotProvider>
                <Header />
                <main className="flex-1">
                  {children}
                </main>
              </SlotProvider>
            </StudentProvider>
          </PromotionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
