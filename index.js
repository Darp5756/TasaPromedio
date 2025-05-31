fetch('https://pydolarve.org/api/v1/dollar?page=alcambio')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const resultados = data['monitors'];
        const monitor_bcv = resultados['bcv'];
        const monitor_paralelo = resultados['enparalelovzla'];
        const monitor_promedio = resultados['promedio'];

        //BCV
        const tasa_bcv = monitor_bcv['price'];
        const fecha_bcv = monitor_bcv['last_update'];
        document.getElementById('tasa_bcv').innerHTML = parseFloat(tasa_bcv).toFixed(2);
        document.getElementById('fecha_bcv').innerHTML = fecha_bcv;

        //Paralelo
        const tasa_paralelo = monitor_paralelo['price'];
        const fecha_paralelo = monitor_paralelo['last_update'];
        document.getElementById('tasa_paralelo').innerHTML = parseFloat(tasa_paralelo).toFixed(2);
        document.getElementById('fecha_paralelo').innerHTML = fecha_paralelo;

        //Promedio
        const tasa_promedio = monitor_promedio['price'];
        const fecha_promedio = monitor_promedio['last_update'];
        document.getElementById('tasa_promedio').innerHTML = parseFloat(tasa_promedio).toFixed(2);
        document.getElementById('fecha_promedio').innerHTML = fecha_promedio;
    })
    .catch(error => {
        const no_disponible = document.getElementById('no-disponible');
        no_disponible.style.display = 'flex';
        console.error('Error:', error);
    }).finally(() => {
        const loader = document.getElementById('loader');
        loader.style.display = 'none';
    });
