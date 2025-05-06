// src/app/dashboard/promotions/page.tsx
'use client'

import React, { useContext, useState } from 'react'
import { PromotionContext } from '@/context/PromotionContext'

export default function PromotionsPage() {
  const { promotions, addPromotion, updatePromotion, deletePromotion } = useContext(PromotionContext)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#4ade80')
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId !== null) {
      updatePromotion(editingId, { name, color })
      setEditingId(null)
    } else {
      addPromotion({ name, color })
    }
    setName('')
    setColor('#4ade80')
  }

  const startEdit = (id: number) => {
    const p = promotions.find(p => p.id === id)
    if (!p) return
    setEditingId(id)
    setName(p.name)
    setColor(p.color)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Promociones</h1>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-6">
        <input
          type="text"
          placeholder="Nombre de la promoción"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="w-10 h-10 p-0 border-0"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {editingId !== null ? 'Guardar' : 'Crear'}
        </button>
      </form>

      <ul className="space-y-2">
        {promotions.map(p => (
          <li key={p.id} className="flex items-center justify-between p-2 border rounded">
            <div className="flex items-center gap-4">
              <span className="w-4 h-4" style={{ backgroundColor: p.color }} />
              <span>{p.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEdit(p.id)}
                className="text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => deletePromotion(p.id)}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}