// src/domain/entities/detalle-receta.entity.ts
export interface DetalleReceta {
  id: number
  receta: number
  producto: number
  producto_nombre: string
  dosis: string
  frecuencia: string
  duracion_dias: number
  observaciones: string
}
