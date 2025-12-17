Promise.all([
  fetch("https://api.dolarvzla.com/public/exchange-rate"),
])
.then(async ([res1]) => {
	if (!res1.ok) {
      throw new Error(`Error HTTP: ${res1.status}`);
    }

	//BCV
    const monitor_bcv = await res1.json();    
    const tasa_bcv = monitor_bcv.current.eur;
    const fecha_bcv = monitor_bcv.current.date;
    document.getElementById("tasa_bcv").innerHTML = parseFloat(tasa_bcv).toFixed(2);
    document.getElementById("fecha_bcv").innerHTML = formatearFecha(fecha_bcv);
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
    const fecha = new Date(fechaInput.replace(/-/g, '\/'));
    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const anio = fecha.getFullYear();
    const horas = (fecha.getHours() % 12 || 12).toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const ampm = fecha.getHours() >= 12 ? "PM" : "AM";
    return `${dia}/${mes}/${anio}, ${horas}:${minutos} ${ampm}`;
}
