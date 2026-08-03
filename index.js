const MONEDAS = {
    dolar: {
        label: "Dólar",
        endpoint: "https://ve.dolarapi.com/v1/dolares",
    },
    euro: {
        label: "Euro",
        endpoint: "https://ve.dolarapi.com/v1/euros",
    },
};

const TAB_ACTIVA = "dolar"; // por defecto Dólar

const tabEuro = document.getElementById("tab_euro");
const tabDolar = document.getElementById("tab_dolar");

function cambiarTab(moneda) {
    // Actualizar tab activa
    tabEuro.classList.toggle("active", moneda === "euro");
    tabDolar.classList.toggle("active", moneda === "dolar");

    // Limpiar valores anteriores
    document.getElementById("tasa_bcv").innerHTML = "";
    document.getElementById("fecha_bcv").innerHTML = "";
    document.getElementById("tasa_paralelo").innerHTML = "";
    document.getElementById("fecha_paralelo").innerHTML = "";
    document.getElementById("tasa_promedio").innerHTML = "";
    document.getElementById("fecha_promedio").innerHTML = "";

    const no_disponible = document.getElementById("no-disponible");
    no_disponible.style.display = "none";
    const loader = document.getElementById("loader");
    loader.style.display = "flex";

    cargarTasas(moneda);
}

function cargarTasas(moneda) {
    const endpoint = MONEDAS[moneda].endpoint;

    fetch(endpoint)
        .then(async (res) => {
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }

            const cotizaciones = await res.json();
            const oficial = cotizaciones.find((c) => c["fuente"] === "oficial");
            const paralelo = cotizaciones.find((c) => c["fuente"] === "paralelo");

            // BCV (oficial)
            document.getElementById("tasa_bcv").innerHTML =
                parseFloat(oficial["promedio"]).toFixed(2);
            document.getElementById("fecha_bcv").innerHTML =
                formatearFecha(oficial["fechaActualizacion"]);

            // Paralelo
            document.getElementById("tasa_paralelo").innerHTML =
                parseFloat(paralelo["promedio"]).toFixed(2);
            document.getElementById("fecha_paralelo").innerHTML =
                formatearFecha(paralelo["fechaActualizacion"]);

            // Promedio
            const tasa_bcv = parseFloat(oficial["promedio"]);
            const tasa_paralelo = parseFloat(paralelo["promedio"]);
            const tasa_promedio =
                Math.round(((tasa_bcv + tasa_paralelo) / 2) * 100) / 100;
            document.getElementById("tasa_promedio").innerHTML =
                parseFloat(tasa_promedio).toFixed(2);
            document.getElementById("fecha_promedio").innerHTML =
                formatearFecha(new Date().toISOString());
        })
        .catch((error) => {
            const no_disponible = document.getElementById("no-disponible");
            no_disponible.style.display = "flex";
            console.error("Error:", error);
        })
        .finally(() => {
            const loader = document.getElementById("loader");
            loader.style.display = "none";
        });
}

tabEuro.addEventListener("click", () => cambiarTab("euro"));
tabDolar.addEventListener("click", () => cambiarTab("dolar"));

// Cargar moneda por defecto
cambiarTab(TAB_ACTIVA);

function formatearFecha(fechaInput) {
    const fecha = new Date(fechaInput);
    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const anio = fecha.getFullYear();
    const horas = (fecha.getHours() % 12 || 12).toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const ampm = fecha.getHours() >= 12 ? "PM" : "AM";
    return `${dia}/${mes}/${anio}, ${horas}:${minutos} ${ampm}`;
}