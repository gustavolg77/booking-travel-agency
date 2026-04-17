# Booking Travel Agency

Proyecto full stack para la gestion de una agencia de viajes.

## Estructura

- `backend/`: API en Express + TypeScript + Prisma.
- `backend/src/config`: entorno, logger y configuraciones globales.
- `backend/src/core`: manejo de errores y middlewares base.
- `backend/src/modules`: modulos de negocio organizados por dominio.
- `backend/src/shared`: utilidades y tipos reutilizables.
- `frontend/`: aplicacion web en Next.js.
- `frontend/app`: rutas y layouts del App Router.
- `frontend/features`: funcionalidades agrupadas por dominio.
- `frontend/components`: componentes compartidos y layout.
- `frontend/lib`: configuracion, acceso a API y helpers de sesion.
- `backend/prisma/`: esquema, migraciones y seed para PostgreSQL.

## Stack actual

- Frontend: Next.js 16, React 19, Tailwind CSS 4.
- Backend: Express, TypeScript, Prisma, JWT, bcrypt.
- Base de datos: PostgreSQL.

## Variables de entorno

1. Crear `backend/.env` a partir de `backend/.env.example`.
2. Crear `frontend/.env.local` a partir de `frontend/.env.example`.

## Comandos utiles

Desde la raiz:

```bash
npm run dev:backend
npm run dev:frontend
npm run typecheck
```

Desde `backend/`:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Convenciones recomendadas

- Cada modulo nuevo del backend deberia tener `controller`, `service`, `routes`, `types` y `validators`.
- Cada feature nueva del frontend deberia vivir en `frontend/features/<feature>`.
- Componentes compartidos van en `frontend/components`.
- Evitar hardcodes de URLs, secretos y textos globales; usar `env`, `config` y constantes.

## Estado actual

La base ya quedo preparada para crecer con mejor orden. El siguiente paso natural es modelar el dominio de la agencia y crear modulos reales como clientes, reservas, ventas, pagos y proveedores.
