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

## Equipo — cómo extender el proyecto

Kevin (facturación) y Johan (clínica) agregan sus módulos siguiendo el patrón
hexagonal ya establecido. **Toda la guía de trabajo está en
[`docs/GUIA-EQUIPO.md`](docs/GUIA-EQUIPO.md)**: piezas reutilizables ya listas,
los 9 pasos para agregar un recurso, requisitos del profe, trampas del backend
y checklist antes del Pull Request.

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
