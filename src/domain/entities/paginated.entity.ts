// src/domain/entities/paginated.entity.ts
/**
 * Envoltura de paginación estándar de Django REST Framework.
 * Todos los listados devuelven esta forma: 10 resultados por página.
 */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
