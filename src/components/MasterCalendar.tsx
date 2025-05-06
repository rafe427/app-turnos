// src/components/MasterCalendar.tsx
'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import Modal from 'react-modal';

import { SlotContext, type Slot } from '../context/SlotContext';
import { PromotionContext } from '../context/PromotionContext';
import { AuthContext } from '../context/AuthContext';

// Máximo de horas por clase
const MAX_HORAS: Record<Slot['clase'], number> = { A: 5, B: 5, C: 5, D: 10 };

interface FormData {
  title: string;
  promoId: number;
  clase: Slot['clase'];
  flownHours: number;
}

export default function MasterCalendar() {
  const router = useRouter();
  const { user, logout } = useContext<any>(AuthContext);
  const { slots, addSlot, updateSlot, deleteSlot, reserveSlot, markFlown } = useContext(SlotContext);
  const { promotions } = useContext(PromotionContext);

  const [isOpen, setIsOpen] = useState(false);
  const [modalDate, setModalDate] = useState<{ startStr: string; endStr: string } | null>(null);
  const [form, setForm] = useState<FormData>({
    title: '',
    promoId: promotions[0]?.id ?? 0,
    clase: 'A',
    flownHours: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    Modal.setAppElement('body');
  }, []);

  const currentSlot = editingId
    ? slots.find(s => s.id === editingId)
    : null;

  function openModal(startStr: string, endStr: string, slot?: Slot) {
    if (slot) {
      setEditingId(slot.id);
      setForm({
        title: slot.title,
        promoId: slot.promoId,
        clase: slot.clase,
        flownHours: slot.flownHours ?? 0,
      });
      setModalDate({ startStr: slot.start, endStr: slot.end });
    } else {
      setEditingId(null);
      setForm({ title: '', promoId: promotions[0]?.id ?? 0, clase: 'A', flownHours: 0 });
      setModalDate({ startStr, endStr });
    }
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setModalDate(null);
    setEditingId(null);
  }

  function handleSelect(info: DateSelectArg) {
    openModal(info.startStr, info.endStr);
  }

  function handleDateClick(info: DateClickArg) {
    openModal(info.dateStr, info.dateStr);
  }

  function handleEventClick(info: EventClickArg) {
    const slot = slots.find(s => s.id === info.event.id);
    if (!slot) return;
    openModal(slot.start, slot.end, slot);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !modalDate) return;
    if (editingId) {
      updateSlot(editingId, {
        title: form.title,
        promoId: form.promoId,
        clase: form.clase,
      });
    } else {
      addSlot({
        id: String(Date.now()),
        start: modalDate.startStr,
        end: modalDate.endStr,
        title: form.title,
        promoId: form.promoId,
        clase: form.clase,
        available: true,
      });
    }
    closeModal();
  }

  function handleDelete() {
    if (editingId) deleteSlot(editingId);
    closeModal();
  }

  function handleReserve() {
    if (editingId && user) {
      reserveSlot(editingId, user.username);
      closeModal();
    }
  }

  function handleMarkFlown() {
    if (editingId) {
      markFlown(editingId, form.flownHours);
      closeModal();
    }
  }

  const events = slots.map((s: Slot) => ({
    id: s.id,
    title: s.available
      ? `${s.title} (${s.clase})`
      : `${s.title} (${s.clase}) — ${s.student}`,
    start: s.start,
    end: s.end,
    backgroundColor: s.available ? '#4ade80' : '#f87171',
    borderColor: s.available ? '#4ade80' : '#f87171',
  }));

  return (
    <div className="flex h-full">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <nav className="space-y-2">
          {user?.isAdmin && (
            <>
              <button onClick={() => router.push('/dashboard')} className="block w-full p-2 hover:bg-gray-700 rounded">Calendario</button>
              <button onClick={() => router.push('/dashboard/promotions')} className="block w-full p-2 hover:bg-gray-700 rounded">Promociones</button>
              <button onClick={() => router.push('/dashboard/students')} className="block w-full p-2 hover:bg-gray-700 rounded">Alumnos</button>
              <button onClick={() => router.push('/dashboard/historial')} className="block w-full p-2 hover:bg-gray-700 rounded">Historial</button>
            </>
          )}
          <button onClick={() => { logout(); router.push('/auth/login'); }} className="block w-full p-2 hover:bg-gray-700 rounded mt-4">Cerrar sesión</button>
        </nav>
      </aside>
      <main className="flex-1 p-4 bg-gray-100 overflow-auto">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          initialView="dayGridMonth"
          selectable
          select={handleSelect}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          events={events}
          height="auto"
        />
        {/* … después de your <FullCalendar> … */}
<div className="mt-8 p-4 bg-white rounded shadow">
  <h2 className="text-xl font-semibold mb-4">Turnos Volados</h2>
  <table className="w-full table-auto border-collapse">
    <thead>
      <tr>
        <th className="border px-3 py-1 text-left">Alumno</th>
        <th className="border px-3 py-1">Clase</th>
        <th className="border px-3 py-1">Horas Voladas</th>
      </tr>
    </thead>
    <tbody>
      {slots
        .filter(s => s.flown)
        .map(s => (
          <tr key={s.id}>
            <td className="border px-3 py-1">{s.student}</td>
            <td className="border px-3 py-1 text-center">{s.clase}</td>
            <td className="border px-3 py-1 text-right">{s.flownHours?.toFixed(1)}</td>
          </tr>
        ))
      }
      {slots.filter(s => s.flown).length === 0 && (
        <tr>
          <td colSpan={3} className="border px-3 py-1 text-center text-gray-500">
            No hay turnos volados aún.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

        <Modal
          isOpen={isOpen}
          onRequestClose={closeModal}
          contentLabel="Slot Modal"
          className="bg-white p-6 rounded-lg max-w-md mx-auto mt-20 shadow-lg"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center"
        >
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar Turno' : 'Crear Turno'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Título</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Promoción</label>
              <select
                value={form.promoId}
                onChange={e => setForm({ ...form, promoId: Number(e.target.value) })}
                className="w-full p-2 border rounded"
              >
                {promotions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1">Clase</label>
              <select
                value={form.clase}
                onChange={e => setForm({ ...form, clase: e.target.value as Slot['clase'] })}
                className="w-full p-2 border rounded"
              >
                <option value="A">A (5hs)</option>
                <option value="B">B (5hs)</option>
                <option value="C">C (5hs)</option>
                <option value="D">D (10hs)</option>
              </select>
            </div>

            {/* —— Nuevo bloque: solo en edición ADMIN para slots ya reservados —— */}
            {editingId && currentSlot && !currentSlot.available && user?.isAdmin && (
              <>
                <div>
                  <label className="block mb-1">Alumno reservado</label>
                  <input
                    type="text"
                    readOnly
                    value={currentSlot.student || ''}
                    className="w-full p-2 border bg-gray-100 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Horas voladas</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    max={MAX_HORAS[form.clase]}
                    value={form.flownHours}
                    onChange={e => setForm({ ...form, flownHours: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleMarkFlown}
                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                  >
                    Marcar como volado
                  </button>
                </div>
              </>
            )}

            {/* —— Acciones comunes —— */}
            <div className="flex justify-end space-x-2">
              {editingId && (
                <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded">
                  Eliminar
                </button>
              )}
              {!user?.isAdmin && editingId && (
                <button type="button" onClick={handleReserve} className="px-4 py-2 bg-green-600 text-white rounded">
                  Reservar
                </button>
              )}
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                {editingId ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
