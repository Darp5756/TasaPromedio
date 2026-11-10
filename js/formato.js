// Formato de números y fechas para Venezuela.

const formatoTasa = new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatoPorcentaje = new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

const formatoFecha = new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
});

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** 1057.313401 → "1.057,31" */
export function formatearTasa(valor) {
    return formatoTasa.format(valor);
}

/** 17.57 → "17,6%" */
export function formatearPorcentaje(valor) {
    return `${formatoPorcentaje.format(valor)}%`;
}

/** Redondea a 2 decimales. */
export function redondear(valor) {
    return Math.round(valor * 100) / 100;
}

/**
 * Formatea una fecha ISO en hora de Caracas: "10/11/2026, 10:01 AM".
 * Si la hora es exactamente medianoche (el BCV publica solo el día),
 * devuelve solo la fecha: "10/11/2026".
 */
export function formatearFecha(fechaIso) {
    const partes = {};
    for (const { type, value } of formatoFecha.formatToParts(new Date(fechaIso))) {
        partes[type] = value;
    }

    const fecha = `${partes.day}/${partes.month}/${partes.year}`;
    const horas24 = Number(partes.hour) % 24;
    if (horas24 === 0 && partes.minute === "00") {
        return fecha;
    }

    const horas = (horas24 % 12 || 12).toString().padStart(2, "0");
    const ampm = horas24 >= 12 ? "PM" : "AM";
    return `${fecha}, ${horas}:${partes.minute} ${ampm}`;
}

/** "2026-11-10" → "Mar 10/11" */
export function formatearDia(fechaIso) {
    const [anio, mes, dia] = fechaIso.split("-").map(Number);
    const diaSemana = DIAS_SEMANA[new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()];
    return `${diaSemana} ${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}`;
}
