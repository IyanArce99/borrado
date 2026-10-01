# BORRADO — MVP web (Madrid)

Plataforma de inteligencia inmobiliaria centrada en los anuncios de vivienda que **desaparecen** del mercado observado en Madrid. No es un portal: “¿Qué se ha borrado?” y “¿Qué pasó antes de desaparecer?”.

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · Geist / Geist Mono.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

Variable opcional: `NEXT_PUBLIC_SITE_URL` (por defecto `https://borrado.es`), usada en metadatos, `sitemap.xml` y `robots.txt`.

## Rutas

| Ruta | Render | Notas |
|---|---|---|
| `/` | estática | Home |
| `/borrados` | dinámica | Filtros y orden en la query string (`?distrito=chamberi&fecha=7&orden=bajada&n=24`) |
| `/vivienda/[id]` | dinámica | Ficha, `robots: noindex` |
| `/estadisticas` | estática | Gráficos interactivos |
| `/explorar` | estática | 20 distritos + Próximamente |
| `/madrid/[slug]` | SSG (20) | Slug desconocido → 404. No existe `/madrid` |
| `/metodologia`, `/agencias`, `/pro` | estáticas | |
| `/api/search?q=` | route handler | Buscador global |

## Estructura

```
lib/
  data.ts       Dataset determinista (PRNG seed 20260930, hoy = 30 SEP 2026) y tipos
  stats.ts      stat(), spark(), facts(), toHuella() — portados del prototipo
  api.ts        getStats, getBorrados, getVivienda, getDistrito, getAgencyFeed, searchSite
  filters.ts    Definición, validación y serialización de filtros (client-safe)
  format.ts     Formateadores deterministas (sin Intl) y fechas relativas por día
  districts.ts  Distritos y barrios
components/
  shell/        Header, TabBar, menú "Más", buscador, toast, tema, UIProvider
  huella.tsx    Huella BORRADO (tarjeta sin foto con sparkline y rastro)
  ...           Gráficos, formularios, feed de agencias, histórico de precio
```

`lib/api.ts` es la única puerta a los datos y sus funciones son asíncronas: para conectar un backend real basta con reimplementarlas.

## Reglas de producto

- Nunca “vendida”: desaparecido ≠ vendido. Sin especular causas; solo hechos observables.
- Sin fotografías. Ubicación máxima: barrio.
- Todo KPI, tarjeta y gráfico lleva “Datos de demostración”.
- Fechas por día (“hoy”, “ayer”, “hace N días”); nunca horas ni minutos.
- Todas las métricas salen del mismo dataset (ayer = 87, últimos 30 días = 1.284; la suma por distritos cuadra con los totales).
- Rojo solo para lo borrado. Radio 0 en todo.

## Tema

`light | dark` en `data-theme` de `<html>`, persistido en `localStorage('borrado-theme')`. Un script inline en `<head>` lo aplica antes del primer pintado (y usa `prefers-color-scheme` en la primera visita).

## Formularios

Validación nativa y confirmación inline; aún sin backend ni pagos.
