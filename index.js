Promise.all([
  fetch("https://pydolarve.org/api/v2/dollar?page=bcv"),
  fetch("https://pydolarve.org/api/v2/dollar?page=binance"),
])
.then(async ([res1, res2]) => {
	if (!res1.ok || !res2.ok) {
      throw new Error(`Error HTTP: ${res1.status} / ${res2.status}`);
    }

    const data1 = await res1.json();
    const data2 = await res2.json();

    const monitor_bcv = data1["monitors"]["usd"];
    const monitor_paralelo = data2["monitors"]["binance"];

	//BCV
    const tasa_bcv = monitor_bcv["price"];
    const fecha_bcv = monitor_bcv["last_update"];
    document.getElementById("tasa_bcv").innerHTML = parseFloat(tasa_bcv).toFixed(2);
    document.getElementById("fecha_bcv").innerHTML = fecha_bcv;

    // Paralelo
    const tasa_paralelo = monitor_paralelo["price"];
    const fecha_paralelo = monitor_paralelo["last_update"];
    document.getElementById("tasa_paralelo").innerHTML = parseFloat(tasa_paralelo).toFixed(2);
    document.getElementById("fecha_paralelo").innerHTML = fecha_paralelo;

    // Promedio
    const tasa_promedio = Math.round(((tasa_bcv + tasa_paralelo) / 2) * 100) / 100;
    const fecha_promedio = (() => {
    	const fecha = new Date();
      	return `${fecha.getDate().toString().padStart(2, "0")}/${(
        	fecha.getMonth() + 1
      	).toString().padStart(2, "0")}/${fecha.getFullYear()}, ${(
        	fecha.getHours() % 12 || 12
      	).toString().padStart(2, "0")}:${fecha.getMinutes().toString().padStart(2, "0")} ${
        	fecha.getHours() >= 12 ? "PM" : "AM"
      	}`;
    })();
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
