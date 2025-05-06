'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../../context/AuthContext';
import { StudentContext, type StudentContextType, type Student } from '../../../context/StudentContext';
import { PromotionContext, type PromotionContextType } from '../../../context/PromotionContext';
import * as XLSX from 'xlsx';

export default function ManageStudentsPage() {
  const router = useRouter();
  const { user } = useContext<any>(AuthContext);
  const { students, addStudent, updateStudent, deleteStudent, importStudents } =
    useContext<StudentContextType>(StudentContext);
  const { promotions } = useContext<PromotionContextType>(PromotionContext);

  // Solo admins
  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/auth/login');
    }
  }, [user, router]);
  if (!user || !user.isAdmin) return null;

  // Estado del formulario
  const [form, setForm] = useState<Omit<Student, 'id'>>({
    nombre: '',
    apellido: '',
    dni: '',
    promocionId: promotions[0]?.id || 0,
    clase: 'A',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateStudent(editingId, form);
      setEditingId(null);
    } else {
      addStudent(form);
    }
    setForm({ nombre: '', apellido: '', dni: '', promocionId: promotions[0]?.id || 0, clase: 'A' });
  };

  const startEdit = (id: string) => {
    const s = students.find(st => st.id === id);
    if (!s) return;
    setEditingId(id);
    setForm({ nombre: s.nombre, apellido: s.apellido, dni: s.dni, promocionId: s.promocionId, clase: s.clase });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // Buscar cabecera
    const headerIdx = rows.findIndex(r =>
      Array.isArray(r) && r.some(c => typeof c === 'string' && c.toLowerCase() === 'nombre')
    );
    if (headerIdx < 0) return;

    const headers = rows[headerIdx] as string[];
    const idx = {
      nombre: headers.findIndex(h => h.toLowerCase() === 'nombre'),
      apellido: headers.findIndex(h => h.toLowerCase() === 'apellido'),
      dni: headers.findIndex(h => h.toLowerCase() === 'dni'),
      promocion: headers.findIndex(h => h.toLowerCase() === 'promocion'),
      clase: headers.findIndex(h => h.toLowerCase() === 'clase'),
    };
    const maxIdx = Math.max(idx.nombre, idx.apellido, idx.dni, idx.promocion, idx.clase);

    const imported: Omit<Student, 'id'>[] = rows
      .slice(headerIdx + 1)
      .filter(r => Array.isArray(r) && r.length > maxIdx)
      .map((r: any[]) => {
        const rawClase = String(r[idx.clase] || '').toUpperCase();
        const clase = ['A', 'B', 'C', 'D'].includes(rawClase) ? (rawClase as Student['clase']) : 'A';
        return {
          nombre: String(r[idx.nombre] || ''),
          apellido: String(r[idx.apellido] || ''),
          dni: String(r[idx.dni] || ''),
          promocionId: Number(r[idx.promocion]) || promotions[0]?.id || 0,
          clase,
        };
      });
    importStudents(imported);
    e.target.value = '';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Alumnos</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          required
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Apellido"
          value={form.apellido}
          onChange={e => setForm({ ...form, apellido: e.target.value })}
          required
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="DNI"
          value={form.dni}
          onChange={e => setForm({ ...form, dni: e.target.value })}
          required
          className="p-2 border rounded"
        />
        <select
          value={form.promocionId}
          onChange={e => setForm({ ...form, promocionId: Number(e.target.value) })}
          className="p-2 border rounded"
        >
          {promotions.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={form.clase}
          onChange={e => setForm({ ...form, clase: e.target.value as Student['clase'] })}
          className="p-2 border rounded"
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        <div className="flex items-center space-x-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {editingId ? 'Guardar' : 'Crear'}
          </button>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="border p-2 rounded"
          />
        </div>
      </form>

      <ul className="space-y-2">
        {students.map(st => (
          <li key={st.id} className="flex items-center justify-between p-2 border rounded">
            <div className="flex-1 grid grid-cols-5 gap-2">
              <span>{st.nombre}</span>
              <span>{st.apellido}</span>
              <span>{st.dni}</span>
              <span>{promotions.find(p => p.id === st.promocionId)?.name}</span>
              <span>{st.clase}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(st.id)} className="text-blue-600 hover:underline">
                Editar
              </button>
              <button onClick={() => deleteStudent(st.id)} className="text-red-600 hover:underline">
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
