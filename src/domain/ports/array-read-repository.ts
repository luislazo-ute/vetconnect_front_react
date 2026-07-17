// src/domain/ports/array-read-repository.ts
/**
 * Contrato de solo lectura para colecciones que NO usan paginación DRF
 * (los endpoints de MongoDB devuelven un array plano).
 */
export interface ArrayReadRepository<T> {
  list(): Promise<T[]>
}
