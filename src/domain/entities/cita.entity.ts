// src/domain/entities/cita.entity.ts
/** Estados posibles de una cita (choices del backend). */
export const EstadoCita = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
} as const

export type EstadoCita = (typeof EstadoCita)[keyof typeof EstadoCita]

export interface Cita {
  id: number
  mascota: number
  mascota_nombre: string
  veterinario: number | null
  veterinario_nombre: string | null
  fecha: string
  hora: string
  motivo: string
  estado: EstadoCita
  estado_display: string
  created_at: string
}
