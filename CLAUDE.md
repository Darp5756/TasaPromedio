# CLAUDE.md

Sitio estático (HTML, CSS y JS puro) que muestra la tasa BCV, la paralela, su promedio y la brecha, para dólar y euro en Venezuela, con historial de 30 días y modo oscuro. Sin dependencias, sin build, sin tests automatizados. Se publica en Vercel.

## Archivos

- `index.html`: marcado. Los IDs `tasa_<id>` y `fecha_<id>` (`bcv`, `paralelo`, `promedio`, `brecha`) los usa `js/app.js`.
- `js/api.js`: `obtenerCotizaciones(moneda)` devuelve `{ oficial, paralelo }`; cada uno es la cotización de la API o `null`. `obtenerHistorico(moneda)` devuelve las series históricas completas.
- `js/formato.js`: formato `es-VE` (`1.057,31`, `17,6%`) y fechas en hora de Caracas.
- `js/app.js`: estado de la interfaz (moneda activa, carga, error, copiar, actualizar). Es el único script del HTML (`type="module"`); importa los demás.
- `js/historial.js`: modal (`<dialog>`) con la tabla de los últimos 30 días. `combinarHistorico` une las series oficial y paralela por fecha.
- `js/tema.js`: botón de modo claro/oscuro. La elección se guarda en `localStorage` (`tema`) y un script en el `<head>` la aplica antes de pintar.
- `css/styles.css`: los colores y las fuentes son variables en `:root`. El modo oscuro redefine esas variables dos veces: con `prefers-color-scheme: dark` (salvo `data-tema="claro"`) y con `:root[data-tema="oscuro"]`. Un color nuevo debe agregarse en los tres bloques.

## API

DolarApi Venezuela, `https://ve.dolarapi.com/v1/dolares` y `/v1/euros`. Cada una devuelve un arreglo con un objeto por fuente:

```json
{ "fuente": "oficial" | "paralelo", "promedio": 899.2705, "fechaActualizacion": "2026-11-10T00:00:00-04:00" }
```

- La fecha del BCV llega como medianoche (solo el día); `formatearFecha` la muestra sin hora.
- Históricos: `/v1/historicos/{dolares|euros}/{oficial|paralelo}` devuelven toda la serie (`{ fecha: "YYYY-MM-DD", promedio }`, un valor por día), sin parámetros de rango. El BCV no publica fines de semana ni feriados; esos días se repite su última tasa (marcada con `*`). El paralelo solo tiene datos desde el 14/02/2026.
- DolarApi recomienda no pedir la misma serie más de una vez cada ~3 horas: el historial se guarda en memoria ese tiempo.
- Hay que citar a DolarApi en la página (está en los créditos del pie).

## Reglas de negocio

- Promedio = `(oficial + paralelo) / 2`, redondeado a 2 decimales.
- Brecha = `(paralelo / oficial − 1) × 100`, con 1 decimal.
- La fecha del promedio es la más reciente de las dos fuentes.
- Si falta una fuente, solo esa tarjeta (y las que dependen de ella) muestra "No disponible". Si falla la petición, se muestra el aviso de servicio no disponible.
- Al cambiar de moneda rápido se descartan las respuestas viejas (`peticionActual`).

## Convenciones

- Código, textos y commits en español.
- En CSS las propiedades van en orden alfabético dentro de cada regla.
- Las tasas siempre con 2 decimales.
- Accesibilidad: botones reales, objetivos táctiles de al menos 44 px y `aria-pressed` en el selector de moneda.

## Probar

```bash
python3 -m http.server 8000
```

Abre <http://localhost:8000> y revisa: dólar, euro, cambio rápido entre pestañas, botones de actualizar y copiar, historial (abrir, cerrar con Esc y clic fuera), modo claro y oscuro, y anchos de 320 px, 390 px y escritorio. Por usar módulos, abrir `index.html` con doble clic no funciona.
