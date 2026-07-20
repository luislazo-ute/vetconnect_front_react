export interface Receta {
  id: number
  cita: number | null
  mascota: number
  mascota_nombre: string
  veterinario: number | null
  veterinario_nombre: string | null
  fecha_emision: string
  valida_hasta: string | null
  instrucciones: string
  created_at: string
}
