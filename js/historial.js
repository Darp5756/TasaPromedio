// Modal con el historial de los últimos días.

import { MONEDAS, obtenerHistorico } from "./api.js";
import { formatearDia, formatearTasa, redondear } from "./formato.js";

const DIAS_HISTORIAL = 30;
// DolarApi recomienda no pedir la misma serie más de una vez cada ~3 horas.
const DURACION_CACHE_MS = 3 * 60 * 60 * 1000;

const cacheHistorial = {};
let peticionHistorial = 0;

function sumarDias(fechaIso, dias) {
    const fecha = new Date(`${fechaIso}T00:00:00Z`);
    fecha.setUTCDate(fecha.getUTCDate() + dias);
    return fecha.toISOString().slice(0, 10);
}

/**
 * Une las series oficial y paralela en filas diarias, de la más reciente a la
 * más antigua. El BCV no publica fines de semana ni feriados: esos días se usa
 * su última tasa y la fila se marca con `oficialRepetido`.
 */
function combinarHistorico(oficial, paralelo, dias = DIAS_HISTORIAL) {
    const mapaOficial = new Map(oficial.map((c) => [c.fecha, c.promedio]));
    const mapaParalelo = new Map(paralelo.map((c) => [c.fecha, c.promedio]));
    const fechasOficial = [...mapaOficial.keys()].sort();
    const ultima = [...fechasOficial, ...mapaParalelo.keys()].sort().at(-1);
    if (!ultima) return [];

    const desde = sumarDias(ultima, -(dias - 1));
    let oficialVigente = null;
    for (const fecha of fechasOficial) {
        if (fecha >= desde) break;
        oficialVigente = mapaOficial.get(fecha);
    }

    const filas = [];
    for (let fecha = desde; fecha <= ultima; fecha = sumarDias(fecha, 1)) {
        const publicado = mapaOficial.has(fecha);
        if (publicado) oficialVigente = mapaOficial.get(fecha);
        const valorParalelo = mapaParalelo.get(fecha) ?? null;
        if (oficialVigente === null && valorParalelo === null) continue;

        filas.push({
            fecha,
            oficial: oficialVigente,
            oficialRepetido: !publicado && oficialVigente !== null,
            paralelo: valorParalelo,
            promedio: oficialVigente !== null && valorParalelo !== null
                ? redondear((oficialVigente + valorParalelo) / 2)
                : null,
        });
    }
    return filas.reverse();
}

function celda(texto, clase) {
    const td = document.createElement("td");
    td.textContent = texto;
    if (clase) td.className = clase;
    return td;
}

function mostrarFilasHistorial(filas) {
    const tbody = document.getElementById("historial_filas");
    const valor = (v) => (v === null ? "—" : formatearTasa(v));

    tbody.replaceChildren(...filas.map((fila) => {
        const tr = document.createElement("tr");
        tr.append(
            celda(formatearDia(fila.fecha)),
            celda(valor(fila.oficial) + (fila.oficialRepetido ? " *" : ""), fila.oficialRepetido ? "repetido" : ""),
            celda(valor(fila.paralelo)),
            celda(valor(fila.promedio), "destacado"),
        );
        return tr;
    }));
}

function mostrarEstadoHistorial(mensaje) {
    const estado = document.getElementById("historial_estado");
    estado.textContent = mensaje ?? "";
    estado.hidden = !mensaje;
    document.getElementById("historial_tabla").hidden = Boolean(mensaje);
    document.getElementById("historial_nota").hidden = Boolean(mensaje);
}

async function obtenerHistoricoConCache(moneda) {
    const guardado = cacheHistorial[moneda];
    if (guardado && Date.now() - guardado.hora < DURACION_CACHE_MS) {
        return guardado.filas;
    }
    const { oficial, paralelo } = await obtenerHistorico(moneda);
    const filas = combinarHistorico(oficial, paralelo);
    cacheHistorial[moneda] = { filas, hora: Date.now() };
    return filas;
}

async function abrirHistorial(moneda) {
    const peticion = ++peticionHistorial;
    const { nombre, codigo } = MONEDAS[moneda];
    document.getElementById("titulo_historial").textContent = `Historial · ${nombre}`;
    document.getElementById("subtitulo_historial").textContent = `Últimos ${DIAS_HISTORIAL} días · Bs/${codigo}`;
    mostrarEstadoHistorial("Cargando historial…");
    document.getElementById("historial").showModal();

    try {
        const filas = await obtenerHistoricoConCache(moneda);
        if (peticion !== peticionHistorial) return;
        if (filas.length === 0) {
            mostrarEstadoHistorial("No hay datos de historial.");
            return;
        }
        mostrarFilasHistorial(filas);
        mostrarEstadoHistorial(null);
    } catch (error) {
        if (peticion !== peticionHistorial) return;
        console.error("Error:", error);
        mostrarEstadoHistorial("No se pudo cargar el historial. Intente más tarde.");
    }
}

export function iniciarHistorial(obtenerMoneda) {
    const modal = document.getElementById("historial");
    document.getElementById("abrir_historial").addEventListener("click", () => abrirHistorial(obtenerMoneda()));
    document.getElementById("cerrar_historial").addEventListener("click", () => modal.close());
    // Clic en el fondo oscuro (fuera del contenido) cierra el modal.
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
}
