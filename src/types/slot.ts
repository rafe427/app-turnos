// src/types/slot.ts
export interface Slot {
    id: string;               // Identificador único
    title: string;            // Título del turno
    start: string;            // Fecha/hora ISO de inicio
    end: string;              // Fecha/hora ISO de fin
    available: boolean;       // Libre o reservado
    promo: number;            // 0 = Antiguos, 1,2,… = promocion
    student?: string;         // Nombre del alumno asignado (opcional)
    status?:                 // Estado de vuelo
      | 'reserved'           // reservado pero no volado aún
      | 'flown'              // efectivamente volado
      | 'cancelled'          // cancelado manualmente
      | 'no-weather';        // no volado por mal tiempo
  }
  