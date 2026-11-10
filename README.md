# Tasa Promedio

Página web que muestra el tipo de cambio del bolívar frente al **dólar** y al **euro**:

- **BCV oficial**: tasa publicada por el Banco Central de Venezuela.
- **Paralelo**: tasa del mercado paralelo (Yadio).
- **Promedio**: `(BCV + Paralelo) ÷ 2`, redondeado a 2 decimales.
- **Brecha**: cuánto más alto está el paralelo respecto al BCV, en porcentaje.

También permite copiar la tasa promedio con un clic, actualizar los datos, ver el historial de los últimos 30 días y cambiar entre modo claro y oscuro.

## Datos

Las tasas vienen de [DolarApi](https://dolarapi.com/docs/venezuela/):

| Moneda | Endpoint |
|---|---|
| Dólar | `https://ve.dolarapi.com/v1/dolares` |
| Euro | `https://ve.dolarapi.com/v1/euros` |
| Historial | `https://ve.dolarapi.com/v1/historicos/{dolares,euros}/{oficial,paralelo}` |

Origen de cada serie: [BCV](https://bcv.org.ve/) (oficial) y [Yadio](https://yadio.io/) (paralelo).
Según las [condiciones de uso](https://dolarapi.com/docs/uso) de DolarApi, cualquier publicación que use estos datos debe citar el servicio.

## Estructura

```
index.html         Página
css/styles.css     Estilos
js/app.js          Interfaz: pestañas, tarjetas, copiar y actualizar
js/api.js          Llamadas a DolarApi
js/historial.js    Modal con el historial de 30 días
js/tema.js         Modo claro / oscuro
js/formato.js      Formato de tasas, porcentajes y fechas (es-VE, hora de Caracas)
assets/icono.png   Favicon
```

## Correr en local

Es un sitio estático, sin dependencias ni build. Como el JS usa módulos, hay que servirlo con un servidor local en vez de abrir `index.html` con doble clic:

```bash
python3 -m http.server 8000
```

Luego abre <http://localhost:8000>.
