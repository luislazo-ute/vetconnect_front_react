import { AxiosCrudRepository } from '@/infrastructure/adapters/axios-crud.repository'
import { CrudUseCase } from '@/application/use-cases/crud.use-case'
import type { Producto } from '@/domain/entities/producto.entity'
import type { CategoriaProducto } from '@/domain/entities/categoria-producto.entity'
import type { Proveedor } from '@/domain/entities/proveedor.entity'

export const productosUseCase = new CrudUseCase<Producto>(
  new AxiosCrudRepository<Producto>('/productos/'),
)

export const categoriasUseCase = new CrudUseCase<CategoriaProducto>(
  new AxiosCrudRepository<CategoriaProducto>('/categorias-producto/'),
)

export const proveedoresUseCase = new CrudUseCase<Proveedor>(
  new AxiosCrudRepository<Proveedor>('/proveedores/'),
)
