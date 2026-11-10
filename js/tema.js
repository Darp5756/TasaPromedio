// Modo claro / oscuro.
// Por defecto sigue al sistema; si el usuario lo cambia, se guarda su elección.
// El <head> de index.html aplica la elección guardada antes de pintar la página.

const CLAVE_TEMA = "tema";
const COLOR_BARRA = { claro: "#f2f4f7", oscuro: "#0b1018" };
const consultaOscuro = window.matchMedia("(prefers-color-scheme: dark)");

function temaEfectivo() {
    return document.documentElement.dataset.tema || (consultaOscuro.matches ? "oscuro" : "claro");
}

function actualizarBotonTema() {
    const oscuro = temaEfectivo() === "oscuro";
    const boton = document.getElementById("cambiar_tema");
    boton.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    document.getElementById("icono_luna").hidden = oscuro;
    document.getElementById("icono_sol").hidden = !oscuro;
    document.querySelector('meta[name="theme-color"]').content = oscuro ? COLOR_BARRA.oscuro : COLOR_BARRA.claro;
}

function cambiarTema() {
    const nuevo = temaEfectivo() === "oscuro" ? "claro" : "oscuro";
    document.documentElement.dataset.tema = nuevo;
    try {
        localStorage.setItem(CLAVE_TEMA, nuevo);
    } catch {
        // Sin almacenamiento (modo privado, etc.): el cambio dura solo esta visita.
    }
    actualizarBotonTema();
}

export function iniciarTema() {
    document.getElementById("cambiar_tema").addEventListener("click", cambiarTema);
    consultaOscuro.addEventListener("change", actualizarBotonTema);
    actualizarBotonTema();
}
