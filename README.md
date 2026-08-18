# finanzas-ia

App personal de finanzas con categorización automática por IA. Cargás o importás tus gastos, la IA los categoriza, y el dashboard te avisa si vas a pasarte del presupuesto antes de fin de mes.

Producción: **https://finanzas-ia-seven.vercel.app**

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Supabase** (Postgres) vía `service_role`, sin policies de `anon`/`authenticated`
- **NextAuth (Auth.js v5)** con Google como único provider
- **Claude (Anthropic)**: `claude-haiku-4-5` para categorizar gastos importados, `claude-sonnet-5` para el asistente de chat
- Tailwind CSS v4, Recharts, react-hook-form + zod

## Funcionalidad

- **Transacciones**: alta manual, edición, borrado, filtro por mes.
- **Import de Mercado Pago**: subís el export (CSV/XLSX), se parsean las filas, se evita duplicados por hash, y cada transacción se categoriza automáticamente con IA (marca las de baja confianza para revisar después con el filtro "Revisar" en la pantalla de Transacciones).
- **Presupuestos**: uno general por mes y, opcionalmente, uno por categoría.
- **Dashboard**: gastado del mes, presupuesto, proyección de fin de mes (extrapolación lineal según los días transcurridos) con semáforo verde/ámbar/rojo, gráfico de gasto acumulado vs. ritmo de presupuesto, y desglose por categoría.
- **Asistente**: chat con contexto de tus gastos y presupuesto del mes actual, respuestas en streaming.
- **Alertas de presupuesto por email**: un cron diario (`/api/cron/budget-alerts`, Vercel Cron) revisa el presupuesto general y los de cada categoría; si el gasto llega al 80% o al 100%, manda un email (Resend) con el detalle. No reenvía el mismo umbral dos veces (queda registrado en `budget_alerts_log`).

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # completar con tus credenciales (ver abajo)
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Variables de entorno

Ver `.env.local.example` para la lista completa. Resumen de dónde sale cada una:

| Variable | De dónde sale |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Proyecto de Supabase → Project Settings → API |
| `AUTH_SECRET` | `npx auth secret` |
| `NEXTAUTH_URL` | `http://localhost:3000` en local; la URL de producción en Vercel |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud Console → un cliente OAuth de tipo "Aplicación web" |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys. Sin verificar un dominio propio, el sandbox (`onboarding@resend.dev`) solo envía al email con el que te registraste en Resend |
| `CRON_SECRET` | Cualquier string random largo. Vercel manda `Authorization: Bearer $CRON_SECRET` automáticamente en las invocaciones de cron cuando esta env var está seteada en el proyecto |

### Base de datos

Correr `supabase/schema.sql` en el SQL Editor del proyecto de Supabase para crear las tablas (`usuarios`, `transactions`, `monthly_budgets`, `budget_alerts_log`, `chat_messages`).

### Google OAuth

El client ID necesita, como redirect URI autorizado, `<tu-dominio>/api/auth/callback/google` (tanto el de `localhost:3000` para desarrollo como el de producción). Mientras el consent screen esté en modo "Prueba", solo los usuarios agregados como "usuarios de prueba" en Google Auth Platform pueden loguearse.

## Deploy

Conectado a Vercel con Git integration — cada push a `master` deploya a producción. Las env vars están cargadas en Vercel (producción y preview); si cambian, actualizarlas ahí y volver a deployar. El cron de alertas está definido en `vercel.json` (corre una vez por día).
