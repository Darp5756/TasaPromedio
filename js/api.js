// Acceso a DolarApi (https://dolarapi.com/docs/venezuela/).

const API_BASE_URL = "https://ve.dolarapi.com/v1";

export const MONEDAS = {
    dolar: { codigo: "USD", nombre: "Dólar", ruta: "dolares" },
    euro: { codigo: "EUR", nombre: "Euro", ruta: "euros" },
};

async function pedirJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
    }
    return res.json();
}

/**
 * Devuelve las cotizaciones oficial (BCV) y paralela de una moneda.
 * Cada una es `{ promedio, fechaActualizacion, ... }` o `null` si la API no la trae.
 * Lanza un error si la petición falla.
 */
export async function obtenerCotizaciones(moneda) {
    const cotizaciones = await pedirJson(`${API_BASE_URL}/${MONEDAS[moneda].ruta}`);
    const buscar = (fuente) => cotizaciones.find((c) => c.fuente === fuente) ?? null;

    return {
        oficial: buscar("oficial"),
        paralelo: buscar("paralelo"),
    };
}

/**
 * Devuelve las series históricas completas (un valor por día) de una moneda:
 * `{ oficial: [{ fecha: "YYYY-MM-DD", promedio }, ...], paralelo: [...] }`.
 */
export async function obtenerHistorico(moneda) {
    const ruta = `${API_BASE_URL}/historicos/${MONEDAS[moneda].ruta}`;
    const [oficial, paralelo] = await Promise.all([
        pedirJson(`${ruta}/oficial`),
        pedirJson(`${ruta}/paralelo`),
    ]);
    return { oficial, paralelo };
}
