// src/domain/entities/mongo.entity.ts
// Colecciones de MongoDB (documentos con _id string, sin paginación DRF).

export interface FotoGaleria {
  url: string
  descripcion: string
}

/**
 * Documento de galería. La colección tiene DOS formas conviviendo:
 *  - antigua: un álbum con `fotos: [{url, descripcion}]`
 *  - nueva (móvil): una sola foto con `url` directa, sin `fotos`
 * Por eso `fotos`, `url` y `mascota_nombre` son opcionales.
 */
export interface GaleriaMascota {
  _id: string
  mascota_id: number
  descripcion: string
  fotos?: FotoGaleria[]
  url?: string
  mascota_nombre?: string
  created_at: string
}

export interface ConsultaMongo {
  _id: string
  mascota_id: number
  sintoma: string
  fecha: string
  estado: string
}

export interface MonitoreoMongo {
  _id: string
  mascota_id: number
  temperatura: number
  ritmo_cardiaco: number
  timestamp: string
  alerta: boolean
}

export interface NotaVozMongo {
  _id: string
  cita_id: number
  transcripcion: string
  fecha: string
}

export interface TrackingMongo {
  _id: string
  cita_id: number
  veterinario_id: number
  estado: string
  fecha: string
}
