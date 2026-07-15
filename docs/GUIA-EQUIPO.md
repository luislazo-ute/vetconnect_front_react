# Guía interna del equipo — VetConnect Web

**Para Kevin (facturación) y Johan (clínica).** Documento interno, no es la
entrega. Léanlo completo antes de escribir su primera línea. La base
(setup + auth + roles + parte pública + pacientes) ya está hecha; ustedes
**agregan sus módulos encima sin tocar lo que ya funciona.**

> Regla de oro del proyecto: **respeten el patrón.** Si algo no encaja en el
> flujo de abajo, pregúntenle a Luis antes de improvisar. La nota depende de que
> todo el código se vea igual.

---

## 0. Antes de empezar

```bash
git clone https://github.com/luislazo-ute/vetconnect_front_react.git
cd vetconnect_front_react
npm install
cp .env.example .env
npm run dev
```

Entren con los usuarios de prueba (`admin1` / `doctor1` / `cliente1`, clave
`VetConnect2026`) y naveguen la app para ver cómo se comporta según el rol.

**Cada tarea = una rama** desde `main`:

```bash
git checkout main && git pull
git checkout -b VET-04-FACTURACION-PRODUCTOS   # ejemplo Kevin
```

Antes de cada push: `npm run build` **tiene que pasar limpio.** Después: push →
Pull Request → que Luis lo revise → merge a `main`.

---

## 1. Cómo está organizado el código (arquitectura hexagonal)

Cuatro capas. Las flechas indican quién puede importar a quién:

```
presentation → application → domain
infrastructure → domain
```

| Capa | Carpeta | Qué ponen ahí |
|---|---|---|
| **domain** | `src/domain/` | Entidades (`*.entity.ts`), enums, **ports** (`*.repository.ts`, interfaces). TypeScript puro, sin imports de otras capas. |
| **application** | `src/application/` | Casos de uso (`*.use-case.ts`), DTOs de entrada. |
| **infrastructure** | `src/infrastructure/` | Adapters Axios (`axios-*.repository.ts`) y **factories**. |
| **presentation** | `src/presentation/` | Hooks, páginas, componentes, router. |

**Prohibido:**
- `presentation → infrastructure` (excepto importar factories).
- `domain → application`.
- Que un archivo de `domain/` importe algo que no sea de `domain/`.

Si vienen de Flutter: `domain` ≈ `domain/`, `application` ≈ use cases,
`infrastructure` ≈ `data/`, `presentation` ≈ `ui/`.

---

## 2. Lo que YA está hecho — úsenlo tal cual, NO lo reescriban

| Pieza | Dónde | Para qué |
|---|---|---|
| `apiClient` | `infrastructure/http/axios-client.ts` | Instancia Axios única. Ya manda `Bearer` y refresca el token ante 401. **No creen otro `axios.create()`.** |
| `parseApiError` | `infrastructure/http/parse-api-error.ts` | Convierte cualquier error en `ApiException` (`status`, `detail`, `fieldErrors`). Úsenlo en el `catch` de sus adapters. |
| `useAuth()` | `presentation/hooks/useAuth.ts` | Da `user`, `rol`, `isAdmin`, `isDoctor`, `isMedico`, `isAuthenticated` + acciones. |
| `ProtectedRoute` | `presentation/router/ProtectedRoute.tsx` | Guard de rutas con `allowedRoles`. |
| `ReadListRepository<T>` | `domain/ports/read-repository.ts` | Port genérico de solo lectura paginada. |
| `AxiosReadRepository<T>` | `infrastructure/adapters/axios-read.repository.ts` | Adapter genérico: se instancia con el endpoint. |
| `ListUseCase<T>` | `application/use-cases/list.use-case.ts` | Caso de uso genérico de listado. |
| `usePaginatedList()` | `presentation/hooks/usePaginatedList.ts` | Hook de listado paginado (carga, error, página, búsqueda). |
| `Pagination` | `presentation/components/Pagination.tsx` | Control de paginación. |
| `StateViews` | `presentation/components/StateViews.tsx` | `LoadingState`, `ErrorState`, `EmptyState`. |
| `formatPrice / formatDate / toNumber` | `presentation/utils/formatters.ts` | Formateo y conversión de decimales. |
| Componentes shadcn | `presentation/components/ui/` | Button, Input, Card, Table, Dialog, AlertDialog, Select, etc. |

---

## 3. Los 9 pasos para agregar un recurso (ejemplo: `Producto`)

Sigan este orden **de adentro hacia afuera** (domain → presentation). Miren
cómo ya lo hizo la base con `Servicio` (parte pública) o con `Mascota`
(pacientes) y cópienlo cambiando los nombres.

**1. Entidad** — `domain/entities/producto.entity.ts`
Lean el serializer del backend (`facturacion/serializers/`) y copien los campos
EXACTOS. No adivinen. Recuerden: los precios (`DecimalField`) llegan como
**string**.

**2. Port** — `domain/ports/producto.repository.ts`
La interface con los métodos que necesitan.
- Si es **solo lectura**: reusen `ReadListRepository<Producto>`, no creen port nuevo.
- Si tiene **CRUD**: definan el port con `create`, `update`, `delete`, `getById`.

**3. Use case** — `application/use-cases/producto.use-case.ts`
Clase que recibe el port por constructor.
- Solo lectura: reusen `ListUseCase<Producto>`.
- CRUD: clase propia con un método por operación.

**4. Adapter** — `infrastructure/adapters/axios-producto.repository.ts`
Implementa el port con `apiClient` y `parseApiError`.
- Solo lectura: `new AxiosReadRepository<Producto>('/productos/')`.
- CRUD: clase propia. **Siempre** envuelvan en `try/catch` con `throw parseApiError(err)`.

**5. Factory** — `infrastructure/factories/facturacion.factory.ts` (Kevin) /
`clinica.factory.ts` (Johan)
```ts
export const productoUseCase = new ProductoUseCase(new AxiosProductoRepository())
```

**6. Hook** — `presentation/hooks/useProductos.ts`
Encapsula el use-case. Para listados reusen `usePaginatedList(productoUseCase)`.
**Las páginas NUNCA llaman al use-case ni al adapter directamente: siempre vía hook.**

**7. Página** — `presentation/pages/facturacion/ProductosPage.tsx`
`export default` (obligatorio, el router la carga con `lazy()`). Usen los
componentes `StateViews` y `Pagination` como en `MascotasPage.tsx`.

**8. Ruta** — `presentation/router/AppRouter.tsx`
Sus rutas YA existen como placeholder. Reemplacen **solo su línea**:
```tsx
// antes:
<Route path="/facturacion/productos" element={<ProtectedRoute><PlaceholderPage title="Productos — Kevin" /></ProtectedRoute>} />
// después:
<Route path="/facturacion/productos" element={<ProtectedRoute><ProductosPage /></ProtectedRoute>} />
```
Y agreguen el `lazy import` arriba. **No toquen las rutas de los demás.**

**9. Navegación** — `presentation/components/AppShell.tsx`
Agreguen su `NavLink` en el bloque que corresponda al rol (usen los flags de
`useAuth()`: `isAdmin`, `isMedico`, etc.).

---

## 4. Requisitos del profe (obligatorios en CADA pantalla)

- ✅ **Toast de éxito** al crear/actualizar: `import { toast } from 'sonner'` → `toast.success('Producto creado')`.
- ✅ **Confirmación antes de eliminar**: usen `AlertDialog` de shadcn. Nunca borren sin preguntar.
- ✅ **Loading, error y vacío**: usen `LoadingState` / `ErrorState` / `EmptyState`.
- ✅ **Validaciones de formulario** con React Hook Form + Zod (patrón `register`/`errors`, como en `LoginPage.tsx` y `ContactoPage.tsx`). **No** usen los componentes `Form`/`FormField` de shadcn.
- ✅ **Todo contra la API real.** Prohibido mock.
- ✅ **Roles de verdad**: oculten en la UI lo que el rol no puede hacer, y protejan la ruta con `allowedRoles`.

---

## 5. Trampas del backend (esto ya costó horas, no las repitan)

- **No hay escritura anidada.** Factura, Compra y Receta son planos. Para crear
  una factura con líneas: `POST /facturas/` → agarran el `id` → un
  `POST /detalles-factura/` por cada línea (N+1 peticiones). Igual con
  `/detalles-compra/` y `/detalles-receta/`.
- `Habitacion` usa `codigo` (ej. "H-101") y `estado`. **No** tiene `nombre` ni `disponible`.
- `Hospitalizacion` **no** tiene campo `estado`: si está activa se deduce de que
  `fecha_alta` sea null. Dar de alta = `PATCH {fecha_alta: <ahora>}`. Usa `tratamiento`.
- `Receta` usa `fecha_emision` e `instrucciones`. Sus detalles apuntan a un
  `producto` (FK), no a texto libre, y usan `duracion_dias`.
- `Notificacion` usa `created_at`. Marcar leída: `PATCH /notificaciones/<id>/marcar_leida/`
  y `PATCH /notificaciones/marcar_todas_leidas/` (esas las llama cualquier autenticado).
- `DecimalField` llega como **string** (`"25.00"`). Conviertan con `toNumber()` antes de operar.
- Los listados vienen paginados: `{count, next, previous, results[]}`, 10 por página.

---

## 6. Quién hace qué

### Kevin — Facturación
Rutas ya creadas: `/facturacion/productos`, `/facturacion/facturas`,
`/facturacion/proveedores`, `/facturacion/compras`.
Endpoints: `/productos/`, `/categorias-producto/`, `/facturas/`,
`/detalles-factura/`, `/pagos/`, `/proveedores/`, `/compras/`, `/detalles-compra/`.
Permisos: escribe **ADMIN**; doctor y usuario **solo leen**.

### Johan — Clínica
Rutas ya creadas: `/clinica/vacunas`, `/clinica/recetas`,
`/clinica/hospitalizaciones`, `/clinica/habitaciones`, `/notificaciones`.
Endpoints: `/vacunas/`, `/recetas/`, `/detalles-receta/`,
`/hospitalizaciones/`, `/habitaciones/`, `/notificaciones/`.
Permisos: actos médicos (vacunas, recetas, hospitalizaciones) escribe **ADMIN o
DOCTOR**; habitaciones solo **ADMIN**; notificaciones las marca leída cualquiera.

> Los CRUD (crear/editar/eliminar) exigen un port con escritura, no el
> `ReadListRepository` genérico. Pídanle a Luis el patrón de un CRUD completo
> cuando lleguen ahí — no lo inventen.

---

## 7. Checklist antes de tu Pull Request

- [ ] `npm run build` pasa sin errores.
- [ ] Seguí los 9 pasos (entidad → … → navegación).
- [ ] La página usa un hook, no el use-case directo.
- [ ] Toast al guardar, confirmación al borrar.
- [ ] Loading / error / vacío manejados.
- [ ] La ruta está protegida con el rol correcto.
- [ ] No toqué archivos de la base ni rutas de mis compañeros.
- [ ] No subí `.env` ni credenciales.
