// src/domain/entities/servicio.entity.ts
/**
 * Servicio de la veterinaria (endpoint público /servicios/).
 * Ojo: `precio` es un DecimalField de DRF y viaja como STRING ("25.00").
 * Usar toNumber() de formatters antes de operar con él.
 */
export interface Servicio {
  id: number
  nombre: string
  descripcion: string
  precio: string
  duracion_minutos: number
  is_active: boolean
}
