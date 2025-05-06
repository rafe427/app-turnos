// src/components/Header.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo y título */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="DOSArg Logo"
            width={100}
            height={24}
          />
          <span className="text-xl font-bold text-gray-800">
            DOSArg
          </span>
        </Link>

        {/* Mensaje de bienvenida */}
        <div className="text-gray-600">
          ¡Bienvenido al sistema de registro de turnos de instrucción de DOSArg!
        </div>
      </div>
    </header>
  );
}
