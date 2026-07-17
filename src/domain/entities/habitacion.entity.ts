// src/domain/entities/habitacion.entity.ts
/**
 * Habitación de hospitalización (endpoint /habitaciones/).
 * `precio_dia` es DecimalField → viaja como string. `estado` es un choice
 * (disponible / ocupada / mantenimiento). NO existe `nombre` ni `disponible`.
 */
export interface Habitacion {
  id: number
  codigo: string
  tipo: string
  precio_dia: string
  estado: string
  capacidad: number
  observaciones: string
  is_active: boolean
}
