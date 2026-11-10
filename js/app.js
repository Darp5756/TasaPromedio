import { MONEDAS, obtenerCotizaciones } from "./api.js";
import { formatearFecha, formatearPorcentaje, formatearTasa, redondear } from "./formato.js";

const MONEDA_INICIAL = "dolar";
const NO_DISPONIBLE = "No disponible";
const SIN_DATO = "—";

const $ = (id) => document.getElementById(id);

const tabs = {
    dolar: $("tab_dolar"),
    euro: $("tab_euro"),
};
const contenido = $("contenido");
const aviso = $("no-disponible");
const botonActualizar = $("actualizar");
const botonCopiar = $("copiar");
const textoCopiar = $("copiar_texto");

let monedaActual = MONEDA_INICIAL;
let promedioActual = null;

// Identifica la última petición: si el usuario cambia de pestaña antes de que
// responda la anterior, la respuesta vieja se descarta.
let peticionActual = 0;

function mostrar(id, tasa, fecha) {
    $(`tasa_${id}`).textContent = tasa;
    const elFecha = $(`fecha_${id}`);
    if (elFecha) elFecha.textContent = fecha;
}

function limpiar() {
    for (const id of ["bcv", "paralelo", "promedio", "brecha"]) {
        mostrar(id, "", "");
    }
    $("barra_brecha").style.width = "0";
    promedioActual = null;
    botonCopiar.disabled = true;
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

    promedioActual = formatearTasa(promedio);
    botonCopiar.disabled = false;
}

function mostrarBrecha(oficial, paralelo) {
    if (!oficial || !paralelo) {
        mostrar("brecha", SIN_DATO);
        return;
    }

    const brecha = (paralelo.promedio / oficial.promedio - 1) * 100;
    mostrar("brecha", formatearPorcentaje(brecha));
    // La barra llega al 100 % con una brecha del 50 %.
    $("barra_brecha").style.width = `${Math.min(Math.max(brecha * 2, 0), 100)}%`;
}

function seleccionarTab(moneda) {
    for (const [clave, tab] of Object.entries(tabs)) {
        tab.setAttribute("aria-pressed", String(clave === moneda));
    }
    $("unidad").textContent = `Bs/${MONEDAS[moneda].codigo}`;
}

async function cargarTasas(moneda) {
    const peticion = ++peticionActual;
    monedaActual = moneda;

    seleccionarTab(moneda);
    limpiar();
    aviso.hidden = true;
    contenido.setAttribute("aria-busy", "true");
    botonActualizar.classList.add("girando");

    try {
        const { oficial, paralelo } = await obtenerCotizaciones(moneda);
        if (peticion !== peticionActual) return;

        mostrarCotizacion("bcv", oficial);
        mostrarCotizacion("paralelo", paralelo);
        mostrarPromedio(oficial, paralelo);
        mostrarBrecha(oficial, paralelo);
    } catch (error) {
        if (peticion !== peticionActual) return;
        console.error("Error:", error);
        for (const id of ["bcv", "paralelo", "promedio", "brecha"]) {
            mostrar(id, SIN_DATO, "");
        }
        aviso.hidden = false;
    } finally {
        if (peticion === peticionActual) {
            contenido.setAttribute("aria-busy", "false");
            botonActualizar.classList.remove("girando");
        }
    }
}

async function copiarPromedio() {
    if (!promedioActual) return;
    try {
        await navigator.clipboard.writeText(promedioActual);
        textoCopiar.textContent = "¡Copiado!";
    } catch {
        textoCopiar.textContent = "No se pudo copiar";
    }
    setTimeout(() => {
        textoCopiar.textContent = "Copiar tasa";
    }, 2000);
}

for (const moneda of Object.keys(MONEDAS)) {
    tabs[moneda].addEventListener("click", () => {
        if (moneda !== monedaActual) cargarTasas(moneda);
    });
}
botonActualizar.addEventListener("click", () => cargarTasas(monedaActual));
botonCopiar.addEventListener("click", copiarPromedio);

cargarTasas(MONEDA_INICIAL);
