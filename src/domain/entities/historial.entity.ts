// src/domain/entities/historial.entity.ts
export interface Historial {
  id: number
  mascota: number
  mascota_nombre: string
  veterinario: number | null
  veterinario_nombre: string | null
  fecha: string
  diagnostico: string
  tratamiento: string
  observaciones: string
}
