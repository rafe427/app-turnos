// src/context/PromotionContext.tsx
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';

// Modelo de datos de promoción
export interface Promotion {
  id: number;
  name: string;
  color: string;
}

// Contexto y tipos asociados
export type PromotionContextType = {
  promotions: Promotion[];
  addPromotion: (promo: Omit<Promotion, 'id'>) => void;
  updatePromotion: (id: number, data: Partial<Omit<Promotion, 'id'>>) => void;
  deletePromotion: (id: number) => void;
};

export const PromotionContext = createContext<PromotionContextType>({} as PromotionContextType);

export function PromotionProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('promotions');
    if (stored) setPromotions(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('promotions', JSON.stringify(promotions));
  }, [promotions]);

  const addPromotion = (promo: Omit<Promotion, 'id'>) => {
    const nextId = promotions.length ? Math.max(...promotions.map(p => p.id)) + 1 : 1;
    setPromotions(prev => [...prev, { id: nextId, ...promo }]);
  };

  const updatePromotion = (id: number, data: Partial<Omit<Promotion, 'id'>>) => {
    setPromotions(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
  };

  const deletePromotion = (id: number) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PromotionContext.Provider value={{ promotions, addPromotion, updatePromotion, deletePromotion }}>
      {children}
    </PromotionContext.Provider>
  );
}
