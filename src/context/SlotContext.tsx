// src/context/SlotContext.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type Slot = {
  id: string;
  start: string;
  end: string;
  title: string;
  promoId: number;
  clase: 'A' | 'B' | 'C' | 'D';
  available: boolean;
  student?: string;
  flown?: boolean;
  flownHours?: number;
};

export type SlotContextType = {
  slots: Slot[];
  addSlot: (s: Slot) => void;
  updateSlot: (id: string, data: Partial<Omit<Slot, 'id'>>) => void;
  deleteSlot: (id: string) => void;
  reserveSlot: (id: string, studentName: string) => void;
  markFlown: (id: string, hours: number) => void;
};

export const SlotContext = createContext<SlotContextType>({} as SlotContextType);

export function SlotProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('slots');
    if (stored) setSlots(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('slots', JSON.stringify(slots));
  }, [slots]);

  const addSlot = (s: Slot) => {
    setSlots(prev => [...prev, s]);
  };

  const updateSlot = (id: string, data: Partial<Omit<Slot, 'id'>>) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.id === id ? { ...slot, ...data } : slot
      )
    );
  };

  const deleteSlot = (id: string) => {
    setSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const reserveSlot = (id: string, studentName: string) => {
    // Conservar student y deshabilitar disponibilidad
    updateSlot(id, { available: false, student: studentName });
  };

  const markFlown = (id: string, hours: number) => {
    // Al marcar volado, conservar student y asegurar available = false
    setSlots(prev =>
      prev.map(slot =>
        slot.id === id
          ? { ...slot, flown: true, flownHours: hours, available: false, student: slot.student }
          : slot
      )
    );
  };

  return (
    <SlotContext.Provider
      value={{ slots, addSlot, updateSlot, deleteSlot, reserveSlot, markFlown }}
    >
      {children}
    </SlotContext.Provider>
  );
}
