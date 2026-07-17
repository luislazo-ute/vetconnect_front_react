import { AxiosCrudRepository } from '@/infrastructure/adapters/axios-crud.repository'
import { CrudUseCase } from '@/application/use-cases/crud.use-case'
import type { Producto } from '@/domain/entities/producto.entity'
import type { CategoriaProducto } from '@/domain/entities/categoria-producto.entity'
import type { Proveedor } from '@/domain/entities/proveedor.entity'
import type { Factura } from '@/domain/entities/factura.entity'
import type { DetalleFactura } from '@/domain/entities/detalle-factura.entity'
import type { Pago } from '@/domain/entities/pago.entity'
import type { Compra } from '@/domain/entities/compra.entity'
import type { DetalleCompra } from '@/domain/entities/detalle-compra.entity'

export const productosUseCase = new CrudUseCase<Producto>(
  new AxiosCrudRepository<Producto>('/productos/'),
)

export const categoriasUseCase = new CrudUseCase<CategoriaProducto>(
  new AxiosCrudRepository<CategoriaProducto>('/categorias-producto/'),
)

export const proveedoresUseCase = new CrudUseCase<Proveedor>(
  new AxiosCrudRepository<Proveedor>('/proveedores/'),
)

export const facturasUseCase = new CrudUseCase<Factura>(
  new AxiosCrudRepository<Factura>('/facturas/'),
)

export const detallesFacturaUseCase = new CrudUseCase<DetalleFactura>(
  new AxiosCrudRepository<DetalleFactura>('/detalles-factura/'),
)

export const pagosUseCase = new CrudUseCase<Pago>(
  new AxiosCrudRepository<Pago>('/pagos/'),
)

export const comprasUseCase = new CrudUseCase<Compra>(
  new AxiosCrudRepository<Compra>('/compras/'),
)

export const detallesCompraUseCase = new CrudUseCase<DetalleCompra>(
  new AxiosCrudRepository<DetalleCompra>('/detalles-compra/'),
)
