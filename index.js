fetch('https://pydolarve.org/api/v1/dollar')
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

        //BCV
        const tasa_bcv = monitor_bcv['price'];
        const fecha_bcv = monitor_bcv['last_update'];
        document.getElementById('tasa_bcv').innerHTML = tasa_bcv;
        document.getElementById('fecha_bcv').innerHTML = fecha_bcv;

        //Paralelo
        const tasa_paralelo = monitor_paralelo['price'];
        const fecha_paralelo = monitor_paralelo['last_update'];
        document.getElementById('tasa_paralelo').innerHTML = tasa_paralelo;
        document.getElementById('fecha_paralelo').innerHTML = fecha_paralelo;

        //Promedio
        const tasa_promedio = Math.round(((tasa_bcv + tasa_paralelo) / 2) * 100) / 100;
        const fecha_promedio = (() => {
            const fecha = new Date();
            return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}, ${(fecha.getHours() % 12 || 12).toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')} ${fecha.getHours() >= 12 ? 'PM' : 'AM'}`;
        })();
        document.getElementById('tasa_promedio').innerHTML = tasa_promedio;
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
