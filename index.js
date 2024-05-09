import puppeteer from "puppeteer";
import fs from "fs";

async function partidosLiga(){
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,

    });
    const page = await browser.newPage();


    await page.goto('https://www.promiedos.com.ar/primera')

    await page.waitForSelector('tr[id^="_"]');
    await page.evaluate(() => {
        irfecha('1_14'); // revisar antes de ejecutar cual es el limite de la fecha actual eso esta inspeccionando
                        // en los botones que tienen los numeros de fecha
    })

    let Fechas = [];
    let i = 2;
    debugger
    await page.waitForSelector('#flechaad');

    while (i !== 28) { // seteo cantidad de fechas a recorrer
        
        await page.waitForSelector('tr[id^="_"]');
        await page.waitForSelector('.game-t1');
        
        //como no hay forma de vincular los partidos (por ahora) unicamente los asigno a un array
        const diasPartido = await page.$$eval('.diapart', dias => {
            return dias.map(dia => dia.textContent.trim());
        });

        let data = await page.evaluate(() => {

            //obtengo todos los partidos de la fecha
            const filaPartido = document.querySelectorAll('tr[id^="_"]');
            const data = [...filaPartido].map(row => { // cada row es un partido
                const local = row.querySelector('.game-t1 .datoequipo').innerText;
                const golesLocal = row.querySelector('.game-r1 span[id^="r1_"]').innerText;
                const golesVisitante = row.querySelector('.game-r2 span[id^="r2_"]').innerText;
                const visitante = row.querySelector('.game-t1:nth-child(5) .datoequipo').innerText;
                const horario = row.querySelector('.game-time').innerText;

                return {
                    local,
                    golesLocal,
                    golesVisitante,
                    visitante,
                    horario,
                    diaPart: "A confirmar" // lo seteo asi pq no se termino esta parte.
                    
                };
            })

            return data;
        });

        data.push({diasAjugar:diasPartido}) // prueba de insercion de partidos a objeto
        
        Fechas.push(data);
        
        await page.evaluate( (i) => {
            irfecha(i + '_14'); // (lo mismo que arriba, chequear el ir fecha)
        }, i)
        // esperar al selector
        i++;
    }

    /***  Posible solucion al asignar fechas  ***/
    //  let liga = Fechas;
    // liga.forEach(fecha => {
    //     fecha.forEach( (partidos) => {
    //         let indexDias = 0;
    //         partidos[0].diaPart = partidos[0].diasAjugar[indexDias]
    //         for (let i = 1; i < partidos.length; i++) {
    //             // Obtener las horas de los partidos actual y anterior
    //             const horaActual = (partidos[i].horario !== undefined) ? parseInt(partidos[i].horario.split(':')[0]) : undefined;
    //             const horaAnterior = (partidos[i-1].horario !== undefined) ? parseInt(partidos[i - 1].horario.split(':')[0]) : undefined;
                
    //             // Si la hora del partido anterior es mayor a la del actual,
    //             // asignar el siguiente día de juego
    //             if (horaAnterior > horaActual) {
    //                 partidos[i].diaPart = partidos[i].diasAjugar[indexDias+1];
    //             } else if(horaActual !== undefined && horaAnterior !== undefined){
    //                 // De lo contrario, mantener el mismo día
    //                 partidos[i].diaPart = partidos[i].diasAjugar[indexDias];
    //             }else{
    //                 partidos[i].diaPart = "A confirmar"
    //             }
    //         }
    //     })
    // })

    // Fechas = liga;

    return Fechas;
    //await browser.close()
}

(async () => {
    const liga = await partidosLiga();  
    fs.writeFileSync('fechas-liga.json', JSON.stringify(liga, null, 2));
})();