// src/context/StudentContext.tsx
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';

// Modelo de datos de alumno
enum ClaseEnum { A = 'A', B = 'B', C = 'C', D = 'D' }
export type Clase = keyof typeof ClaseEnum;

export interface Student {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  promocionId: number;
  clase: Clase;
}

// Contexto y tipos asociados
export type StudentContextType = {
  students: Student[];
  addStudent: (s: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, data: Partial<Omit<Student, 'id'>>) => void;
  deleteStudent: (id: string) => void;
  importStudents: (list: Omit<Student, 'id'>[]) => void;
};

export const StudentContext = createContext<StudentContextType>({} as StudentContextType);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('students');
    if (stored) setStudents(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  const addStudent = (s: Omit<Student, 'id'>) => {
    const newStudent: Student = { id: String(Date.now()), ...s };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (id: string, data: Partial<Omit<Student, 'id'>>) => {
    setStudents(prev => prev.map(st => (st.id === id ? { ...st, ...data } : st)));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(st => st.id !== id));
  };

  const importStudents = (list: Omit<Student, 'id'>[]) => {
    const imported = list.map(s => ({ id: String(Date.now()) + Math.random(), ...s }));
    setStudents(prev => [...prev, ...imported]);
  };

  return (
    <StudentContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, importStudents }}>
      {children}
    </StudentContext.Provider>
  );
}