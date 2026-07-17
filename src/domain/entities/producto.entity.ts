export interface Producto {
  id: number
  nombre: string
  descripcion: string
  categoria: number
  categoria_nombre: string
  precio_venta: string
  stock_actual: number
  stock_minimo: number
  unidad_medida: string
  is_active: boolean
}
