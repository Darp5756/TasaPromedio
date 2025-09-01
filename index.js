Promise.all([
  fetch("https://ve.dolarapi.com/v1/dolares/oficial"),
  fetch("https://ve.dolarapi.com/v1/dolares/paralelo"),
])
.then(async ([res1, res2]) => {
	if (!res1.ok || !res2.ok) {
      throw new Error(`Error HTTP: ${res1.status} / ${res2.status}`);
    }

    const monitor_bcv = await res1.json();
    const monitor_paralelo = await res2.json();

	//BCV
    const tasa_bcv = monitor_bcv["promedio"];
    const fecha_bcv = monitor_bcv["fechaActualizacion"];
    document.getElementById("tasa_bcv").innerHTML = parseFloat(tasa_bcv).toFixed(2);
    document.getElementById("fecha_bcv").innerHTML = formatearFecha(fecha_bcv);

    // Paralelo
    const tasa_paralelo = monitor_paralelo["promedio"];
    const fecha_paralelo = monitor_paralelo["fechaActualizacion"];
    document.getElementById("tasa_paralelo").innerHTML = parseFloat(tasa_paralelo).toFixed(2);
    document.getElementById("fecha_paralelo").innerHTML = formatearFecha(fecha_paralelo);

    // Promedio
    const tasa_promedio = Math.round(((tasa_bcv + tasa_paralelo) / 2) * 100) / 100;
    const fecha_promedio = formatearFecha(new Date().toISOString());
    document.getElementById("tasa_promedio").innerHTML = parseFloat(tasa_promedio).toFixed(2);
    document.getElementById("fecha_promedio").innerHTML = fecha_promedio;
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