export interface Hospitalizacion {
  id: number
  mascota: number
  mascota_nombre: string
  veterinario: number
  veterinario_nombre: string
  habitacion: number
  habitacion_codigo: string
  fecha_ingreso: string
  fecha_alta: string | null
  motivo: string
  diagnostico: string
  tratamiento: string
  created_at: string
}