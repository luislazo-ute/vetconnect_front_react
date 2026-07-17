// src/domain/entities/mongo.entity.ts
// Colecciones de MongoDB (documentos con _id string, sin paginación DRF).

export interface FotoGaleria {
  url: string
  descripcion: string
}

export interface GaleriaMascota {
  _id: string
  mascota_id: number
  descripcion: string
  fotos: FotoGaleria[]
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
