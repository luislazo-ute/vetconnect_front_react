# VetConnect Web

Frontend web de **VetConnect** (sistema veterinario) en React + TypeScript.
Consume la misma API Django (JWT + roles) que usa la app móvil Flutter.

- **Stack:** Vite + React 19 + TypeScript, Tailwind CSS v4, shadcn/ui, Zustand,
  React Router v6, React Hook Form + Zod, Axios, sonner.
- **Arquitectura:** Hexagonal (Ports & Adapters).

---

## Requisitos

- Node.js ≥ 18 y npm ≥ 9.

## Clonar y correr

```bash
git clone <url-del-repo>
cd React_front
npm install
cp .env.example .env      # crea tu .env local (ya apunta a la API de producción)
npm run dev               # http://localhost:5173
```

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload. |
| `npm run build` | **Verificación real**: `tsc -b` + build de producción. Correr antes de cada PR. |
| `npm run preview` | Sirve el build de producción localmente. |
| `npm run lint` | ESLint. |

> Ojo: `npx tsc --noEmit` **no verifica nada** en este proyecto (el tsconfig raíz
> solo tiene referencias). Para chequear tipos usar `npx tsc -b --noEmit` o `npm run build`.

## Variables de entorno

Solo una, en `.env` (ignorado por git; ver `.env.example`):

```
VITE_API_BASE_URL=https://vetconnect-api.uaeftt-ute.site/api
```

## Usuarios de prueba

| Usuario | Clave | Rol |
|---|---|---|
| `admin1` | `VetConnect2026` | ADMIN |
| `doctor1` | `VetConnect2026` | DOCTOR |
| `cliente1` | `VetConnect2026` | USUARIO |

---

## Arquitectura (leer antes de tocar código)

Cuatro capas. **La regla de oro:** las dependencias apuntan hacia adentro.

```
presentation → application → domain
infrastructure → domain
```

- `domain/` — TypeScript puro. Entidades (`*.entity.ts`), enums, excepciones y
  **ports** (`*.repository.ts`, interfaces). No importa de ninguna otra capa.
- `application/` — casos de uso (`*.use-case.ts`, clases que reciben el port por
  constructor) y DTOs de entrada.
- `infrastructure/` — implementaciones reales: adapters Axios (`axios-*.repository.ts`),
  `http/axios-client.ts` (interceptor JWT + refresh), `storage/`, y **factories**
  (cablean cada use-case con su adapter y exportan un singleton).
- `presentation/` — React: stores Zustand, **hooks** (`useAuth`, `usePaginatedList`…),
  páginas (`export default` para `lazy()`), componentes y router.

**Prohibido:** `presentation → infrastructure` (excepto importar factories) y
`domain → application`.

### Regla de los stores/hooks

Las páginas **no consumen el store Zustand directamente**: usan hooks
personalizados en `presentation/hooks/` (`useAuth()`, `usePaginatedList()`…) que
encapsulan selectores y acciones. Repliquen este patrón en sus módulos.

---

## Base que ya está lista (la usan tal cual)

- **`apiClient`** (`infrastructure/http/axios-client.ts`): instancia Axios única.
  Ya manda el `Authorization: Bearer` y refresca el token ante un 401
  (con rotación de refresh + blacklist). **No creen otra instancia de Axios.**
- **`parseApiError`**: normaliza cualquier error a `ApiException` (con `status`,
  `detail` y `fieldErrors`). Úsenlo en el `catch` de sus adapters.
- **Auth y roles:** `useAuth()` devuelve `user`, `rol`, `isAdmin`, `isDoctor`,
  `isMedico`, `isAuthenticated`, y las acciones `login/register/logout`.
- **`ProtectedRoute`** con `allowedRoles`.
- Componentes reutilizables: `Pagination`, `StateViews` (LoadingState / ErrorState /
  EmptyState), y todos los de `components/ui/` (shadcn).
- Utils: `formatPrice`, `formatDate`, `toNumber` (¡los `DecimalField` de DRF llegan
  como string, conviértanlos con `toNumber` antes de operar!).

---

## Cómo agregar su módulo (Kevin: facturación · Johan: clínica)

Sigan el flujo hexagonal. Ejemplo para un recurso `Producto`:

1. **Entidad** — `domain/entities/producto.entity.ts` (la forma que devuelve la API;
   lean el serializer del backend, no adivinen).
2. **Port** — `domain/ports/producto.repository.ts` (interface con los métodos).
   Para listados de solo lectura pueden reusar `ReadListRepository<T>` que ya existe.
3. **Use case** — `application/use-cases/producto.use-case.ts` (recibe el port por
   constructor). Para solo lectura reusen `ListUseCase<T>`.
4. **Adapter** — `infrastructure/adapters/axios-producto.repository.ts`
   (implementa el port usando `apiClient` y `parseApiError`). Para solo lectura
   reusen `AxiosReadRepository<T>('/productos/')`.
5. **Factory** — `infrastructure/factories/facturacion.factory.ts`
   (`export const productoUseCase = new ...`).
6. **Hook** — `presentation/hooks/useProductos.ts` (o reusen `usePaginatedList`).
7. **Página** — `presentation/pages/facturacion/ProductosPage.tsx`
   (`export default`, para `lazy()`).
8. **Ruta** — en `presentation/router/AppRouter.tsx` reemplacen **solo** su
   `<Route>` placeholder por el `lazy import` real. Sus rutas ya están creadas:
   `/facturacion/*` (Kevin) y `/clinica/*` + `/notificaciones` (Johan).
9. **Navegación** — agreguen su `NavLink` en `presentation/components/AppShell.tsx`
   respetando el rol (usen los flags de `useAuth()`).

### Requisitos del profe (obligatorios en cada módulo)

- Toast de éxito (sonner) al crear/actualizar: `toast.success('...')`.
- Confirmación antes de eliminar (usen `AlertDialog` de shadcn).
- Manejar loading, error y validaciones en formularios (Zod).
- Nada de datos mock: todo contra la API real.

### Trampas del backend (ya documentadas, ahorran horas)

- **No hay escritura anidada**: factura/compra/receta son planos → `POST` del padre,
  agarrar el `id`, y `POST` por cada línea.
- `Habitacion` usa `codigo` y `estado` (no `nombre`/`disponible`).
- `Hospitalizacion` no tiene `estado`: se deduce de `fecha_alta` (null = activa).
- `Receta` usa `fecha_emision` e `instrucciones`; sus detalles apuntan a `producto` (FK).
- `Notificacion` usa `created_at`; marcar leída con `PATCH /notificaciones/<id>/marcar_leida/`.
- `DecimalField` → llega como **string** (`"25.00"`). Convertir con `toNumber`.

---

## Rutas

**Públicas:** `/`, `/servicios`, `/servicios/:id`, `/equipo`, `/contacto`
**Auth:** `/login`, `/registro`
**Privadas (todo autenticado):** `/panel`, `/perfil`, `/mascotas`, `/citas`
**Admin o doctor:** `/historiales`
**Solo admin:** `/clientes`
**Facturación (Kevin):** `/facturacion/{productos,facturas,proveedores,compras}`
**Clínica (Johan):** `/clinica/{vacunas,recetas,hospitalizaciones,habitaciones}`, `/notificaciones`

## Flujo de trabajo git

Rama por tarea (`VET-XX-NOMBRE`) desde `main` → commits → push → PR → revisión →
merge a `main`. Verificar local con `npm run build` antes de cada PR.
