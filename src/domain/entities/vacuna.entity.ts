export interface Vacuna {
  id: number
  mascota: number
  mascota_nombre: string
  nombre_vacuna: string
  fecha_aplicacion: string
  fecha_proxima_dosis: string | null
  lote: string
  veterinario: number
  veterinario_nombre: string
  observaciones: string
  created_at: string
}
