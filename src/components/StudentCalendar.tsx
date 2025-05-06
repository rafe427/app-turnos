// src/components/StudentCalendar.tsx
'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import Modal from 'react-modal';

import { SlotContext } from '../context/SlotContext';
import { AuthContext } from '../context/AuthContext';

interface StudentCalendarProps {
  promoId: number;
  username: string;
}

export default function StudentCalendar({ promoId, username }: StudentCalendarProps) {
  const router = useRouter();
  const { logout } = useContext(AuthContext);
  const { slots, updateSlot } = useContext(SlotContext);

  // Modal accessibility
  useEffect(() => {
    Modal.setAppElement('body');
  }, []);

  // Filtrar slots por promoción
  const availableSlots = slots.filter(s => s.promoId === promoId);

  const events = availableSlots.map(s => ({
    id: s.id,
    title: s.available ? s.title : `${s.title} - ${s.student || ''}`,
    start: s.start,
    end: s.end,
    backgroundColor: s.available ? '#4ade80' : '#f87171',
    borderColor: s.available ? '#4ade80' : '#f87171',
  }));

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleEventClick = (info: EventClickArg) => {
    const slot = slots.find(s => s.id === info.event.id && s.available);
    if (slot) {
      setSelectedId(slot.id);
      setConfirmOpen(true);
    }
  };

  const confirmReservation = () => {
    if (selectedId) {
      updateSlot(selectedId, { available: false, student: username });
    }
    setConfirmOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-end p-4">
        <button
          onClick={() => {
            logout();
            router.push('/auth/login');
          }}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Cerrar Sesión
        </button>
      </div>
      <div className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>
      <Modal
        isOpen={confirmOpen}
        onRequestClose={() => setConfirmOpen(false)}
        contentLabel="Confirmar Reserva"
        className="bg-white p-6 rounded-lg max-w-md mx-auto mt-20 shadow-lg"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-semibold mb-4">Confirmar Reserva</h2>
        <p className="mb-6">¿Deseas reservar este turno?</p>
        <div className="flex justify-end space-x-4">
          <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 border rounded">
            Cancelar
          </button>
          <button onClick={confirmReservation} className="px-4 py-2 bg-blue-600 text-white rounded">
            Confirmar
          </button>
        </div>
      </Modal>
    </div>
  );
}
