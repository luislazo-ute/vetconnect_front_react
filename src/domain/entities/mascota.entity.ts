// src/domain/entities/mascota.entity.ts
export interface Mascota {
  id: number
  nombre: string
  especie: string
  especie_display: string
  raza: string
  fecha_nacimiento: string | null
  peso: string | null
  cliente: number
  cliente_nombre: string
  is_active: boolean
  created_at: string
  updated_at: string
}
