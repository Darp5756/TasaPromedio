import { MONEDAS, obtenerCotizaciones } from "./api.js";
import { formatearFecha, formatearTasa, redondear } from "./formato.js";

const MONEDA_INICIAL = "dolar";
const NO_DISPONIBLE = "No disponible";

const tabs = {
    dolar: document.getElementById("tab_dolar"),
    euro: document.getElementById("tab_euro"),
};
const loader = document.getElementById("loader");
const noDisponible = document.getElementById("no-disponible");

// Identifica la última petición: si el usuario cambia de pestaña antes de que
// responda la anterior, la respuesta vieja se descarta.
let peticionActual = 0;

function mostrar(id, tasa, fecha) {
    document.getElementById(`tasa_${id}`).textContent = tasa;
    document.getElementById(`fecha_${id}`).textContent = fecha;
}

function limpiar() {
    for (const id of ["bcv", "paralelo", "promedio"]) {
        mostrar(id, "", "");
    }
}

function mostrarCotizacion(id, cotizacion) {
    if (cotizacion) {
        mostrar(id, formatearTasa(cotizacion.promedio), formatearFecha(cotizacion.fechaActualizacion));
    } else {
        mostrar(id, NO_DISPONIBLE, "");
    }
}

function mostrarPromedio(oficial, paralelo) {
    if (!oficial || !paralelo) {
        mostrar("promedio", NO_DISPONIBLE, "");
        return;
    }

    const promedio = redondear((oficial.promedio + paralelo.promedio) / 2);
    // La fecha del promedio es la del dato más reciente de los dos.
    const fecha = [oficial.fechaActualizacion, paralelo.fechaActualizacion]
        .reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
    mostrar("promedio", formatearTasa(promedio), formatearFecha(fecha));
}

async function cargarTasas(moneda) {
    const peticion = ++peticionActual;

    for (const [clave, tab] of Object.entries(tabs)) {
        tab.classList.toggle("active", clave === moneda);
    }
    limpiar();
    noDisponible.style.display = "none";
    loader.style.display = "flex";

    try {
        const { oficial, paralelo } = await obtenerCotizaciones(moneda);
        if (peticion !== peticionActual) return;

        mostrarCotizacion("bcv", oficial);
        mostrarCotizacion("paralelo", paralelo);
        mostrarPromedio(oficial, paralelo);
    } catch (error) {
        if (peticion !== peticionActual) return;
        console.error("Error:", error);
        noDisponible.style.display = "flex";
    } finally {
        if (peticion === peticionActual) {
            loader.style.display = "none";
        }
    }
}

for (const moneda of Object.keys(MONEDAS)) {
    tabs[moneda].addEventListener("click", () => cargarTasas(moneda));
}

cargarTasas(MONEDA_INICIAL);
