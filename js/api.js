// Acceso a DolarApi (https://dolarapi.com/docs/venezuela/).

const BASE_URL = "https://ve.dolarapi.com/v1";

export const MONEDAS = {
    dolar: { codigo: "USD", endpoint: `${BASE_URL}/dolares` },
    euro: { codigo: "EUR", endpoint: `${BASE_URL}/euros` },
};

/**
 * Devuelve las cotizaciones oficial (BCV) y paralela de una moneda.
 * Cada una es `{ promedio, fechaActualizacion, ... }` o `null` si la API no la trae.
 * Lanza un error si la petición falla.
 */
export async function obtenerCotizaciones(moneda) {
    const res = await fetch(MONEDAS[moneda].endpoint);
    if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
    }

    const cotizaciones = await res.json();
    const buscar = (fuente) => cotizaciones.find((c) => c.fuente === fuente) ?? null;

    return {
        oficial: buscar("oficial"),
        paralelo: buscar("paralelo"),
    };
}
