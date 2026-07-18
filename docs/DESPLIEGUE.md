# Despliegue CI/CD — VetConnect Web

Documentación del pipeline de integración y despliegue continuo del frontend.

## Resumen

Cada `push` a la rama **`main`** dispara un flujo de **GitHub Actions** que:

1. Instala dependencias y **compila** el proyecto (`npm ci` + `npm run build`).
2. Sube el build (`dist/`) por **SCP** a un **VPS Ubuntu**.
3. Activa el nuevo build y **recarga Nginx**, que sirve la SPA.

Archivo del workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

```
push a main ──▶ GitHub Actions ──▶ npm ci + npm run build ──▶ SCP dist/ ──▶ VPS ──▶ Nginx reload
```

## Diagrama del pipeline

```
┌─────────────┐   push    ┌──────────────────────┐
│ Desarrollador│ ───────▶ │  GitHub (rama main)  │
└─────────────┘           └──────────┬───────────┘
                                     │ dispara
                          ┌──────────▼───────────┐
                          │   GitHub Actions     │
                          │  (ubuntu-latest)     │
                          │  1. checkout         │
                          │  2. setup node 20    │
                          │  3. crea .env.production
                          │  4. npm ci           │
                          │  5. npm run build    │
                          └──────────┬───────────┘
                                     │ scp dist/*  (appleboy/scp-action)
                          ┌──────────▼───────────┐
                          │   VPS Ubuntu         │
                          │  /tmp/react_build    │
                          │        │ ssh script  │
                          │        ▼             │
                          │  /var/www/vetconnect_front_react
                          │  chown www-data      │
                          │  nginx -t && reload  │
                          └──────────┬───────────┘
                                     │ sirve
                          ┌──────────▼───────────┐
                          │  Usuario final (web) │
                          └──────────────────────┘
```

## Etapas del workflow (`deploy.yml`)

| Paso | Acción | Detalle |
|---|---|---|
| Checkout | `actions/checkout@v4` | Clona el repo en el runner. |
| Setup Node | `actions/setup-node@v4` | Node 20 con caché de npm. |
| Create env | `printf ... > .env.production` | Escribe la variable de entorno desde el secret `REACT_ENV`. |
| Install | `npm ci` | Instala dependencias de forma reproducible (usa `package-lock.json`). |
| Build | `npm run build` | `tsc -b && vite build` → genera `dist/`. Si falla la compilación o el type-check, el deploy se aborta. |
| Upload | `appleboy/scp-action` | Copia `dist/*` a `/tmp/react_build` en la VPS. |
| Activate | `appleboy/ssh-action` | Reemplaza el contenido de `/var/www/...`, ajusta permisos y recarga Nginx. |

## Secrets de GitHub (Settings → Secrets and variables → Actions)

El workflow requiere estos secrets configurados en el repositorio:

| Secret | Descripción |
|---|---|
| `REACT_ENV` | Contenido del `.env.production`. Debe incluir `VITE_API_BASE_URL=https://vetconnect-api.uaeftt-ute.site/api`. |
| `VPS_HOST` | IP o dominio de la VPS. |
| `VPS_USER` | Usuario SSH de la VPS (con permiso sobre `/var/www` y `nginx`). |
| `VPS_KEY` | Clave **privada** SSH para autenticarse en la VPS. |

## Configuración del servidor (una sola vez)

En la VPS Ubuntu, antes del primer deploy:

```bash
# 1. Nginx
sudo apt update && sudo apt install -y nginx

# 2. Carpeta que sirve la SPA
sudo mkdir -p /var/www/vetconnect_front_react
sudo chown -R www-data:www-data /var/www/vetconnect_front_react
```

Configuración de Nginx (`/etc/nginx/sites-available/vetconnect`):

```nginx
server {
    listen 80;
    server_name TU_DOMINIO_O_IP;

    root /var/www/vetconnect_front_react;
    index index.html;

    # SPA: cualquier ruta cae en index.html (React Router maneja el enrutado).
    # Sin esto, recargar /servicios/5 o /panel da 404.
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Activar el sitio y probar:

```bash
sudo ln -s /etc/nginx/sites-available/vetconnect /etc/nginx/sites-enabled/
sudo nginx -t          # valida la config
sudo systemctl reload nginx
```

> **Clave del enrutado SPA:** el `try_files ... /index.html` es obligatorio. Sin él,
> recargar una ruta interna (ej. `/panel`) devuelve 404, porque el archivo físico
> no existe: es React Router quien resuelve la ruta en el navegador.

## Cómo probar el despliegue

1. Hacer un cambio y `git push` a `main`.
2. En GitHub → pestaña **Actions** → ver el workflow "Deploy vetconnect_front_react to VPS".
3. Si todo pasa en verde, abrir la URL de la VPS: la nueva versión ya está publicada.
4. Si falla, el log del step que falló indica la causa (build roto, secret faltante o SSH rechazado).

## Notas

- El deploy solo corre en `main`, así que las ramas de tarea (`VET-XX-...`) no despliegan:
  primero PR → merge a `main` → recién ahí se publica.
- El `.env` local está en `.gitignore`; en producción la variable la inyecta el
  secret `REACT_ENV`, no un archivo versionado.
