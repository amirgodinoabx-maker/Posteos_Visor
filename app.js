const API_URL = "https://dronexrabbit.abexacloud.com";

const URL_DESPACHOS = `${API_URL}/dispatchs`;
const URL_TRACKS = `${API_URL}/tracks`;

const rutaInput = document.getElementById("ruta");
const placaInput = document.getElementById("placa");
const fechaInput = document.getElementById("fecha");

const tbodyDespachos = document.getElementById("tbodyDespachos");
const tbodyPosteos = document.getElementById("tbodyPosteos");

let listaPosteos = [];
let paginaActual = 1;
const tamanioPagina = 50;


async function buscarDespachos() {

    

    const ruta = rutaInput.value.trim();
    const placa = placaInput.value.trim();
    const fecha = fechaInput.value;

    tbodyDespachos.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;">
                Cargando despachos...
            </td>
        </tr>
    `;

    const url = `${URL_DESPACHOS}/${ruta}/${placa}/${fecha}`;

    console.log("URL:", url);

    try {

         const response = await fetch(url);

        console.log("Status:", response.status);

        const result = await response.json();

        console.log("Respuesta:", result);

        mostrarDespachos(result.data);

    } catch (e) {

        console.error(e);

    }

}



function mostrarDespachos(despachos) {


    console.log("ENTRAR DESPACHO")
    tbodyDespachos.innerHTML = "";

    despachos.forEach((item, index) => {


        tbodyDespachos.innerHTML += `

            <tr>

                <td>${index + 1}</td>

                <td>${formatearFecha(item.DISPATCH_TS)}</td>

                <td>${formatearFecha(item.FIRST_TRACK)}</td>

                <td>${item.TRACK_COUNT}</td>

                <td>${item.ACK_COUNT}</td>

                <td>${item.DIFFERENCE_SECONDS}</td>

                <td>

                    <button class="btn btn-primary"

                        onclick="mostrarTrack(

                            '${rutaInput.value}',

                            '${placaInput.value}',

                            '${item.DISPATCH_TS}'

                        )">

                        <i class="fa-solid fa-play"></i>

                        Ver Track

                    </button>

                </td>

            </tr>

        `;

    });

}


async function buscarPosteos(ruta, placa, fecha) {


    tbodyPosteos.innerHTML = `
        <tr>
            <td colspan="9" style="text-align:center;">
                Cargando posteos...
            </td>
        </tr>
    `;


    const url = `${URL_TRACKS}/${ruta}/${placa}/${fecha}`;

    console.log("URL:", url);

    try {

         const response = await fetch(url);

        console.log("Status:", response.status);

        const result = await response.json();

        console.log("Respuesta:", result);

        listaPosteos = result.data || [];

        paginaActual = 1;

        mostrarPosteosPaginado();

    } catch (e) {

        console.error(e);

    }

}


function mostrarPosteosPaginado(){


    tbodyPosteos.innerHTML = "";


    const inicio =
        (paginaActual - 1) * tamanioPagina;


    const fin =
        inicio + tamanioPagina;


    const pagina =
        listaPosteos.slice(inicio, fin);



    pagina.forEach((item,index)=>{


        console.log("ack_code:", item.ack_code, typeof item.ack_code);

        console.log(
    "valor:", item.ack_code,
    "comparacion:", item.ack_code !== "00",
    "resultado final:", item.ack_code == null || item.ack_code !== "00"
);

        tbodyPosteos.innerHTML += `

        <tr>

            <td>${inicio + index + 1}</td>

            <td> ${item.ack_code == null || item.ack_code !== "00" ? `<span class="status-dot status-dot-red" title="${item.failed_descripcion}"></span>` : '<span class="status-dot status-dot-green" title="OK"></span>'}</td>

            <td>${formatearFecha(item.ts)}</td>

            <td>${item.latitude}</td>

            <td>${item.longitude}</td>

            <td>${item.speed}</td>

            <td>${item.direction_id}</td>

            <td>${item.imei}</td>

            <td>
                <button class="btn btn-primary"
                    onclick="irATrama(${item.latitude}, ${item.longitude})">
                    <i class="fa-solid fa-location-crosshairs"></i>
                </button>
            </td>

        </tr>

        `;


    });

    actualizarPaginacion();

}
function actualizarPaginacion(){


    const total =
    Math.ceil(listaPosteos.length / tamanioPagina);


    const div =
    document.getElementById("paginacion");


    div.innerHTML = `

        <button onclick="cambiarPagina(${paginaActual-1})"
        ${paginaActual===1?'disabled':''}>
            ◀
        </button>


        Página ${paginaActual} de ${total}


        <button onclick="cambiarPagina(${paginaActual+1})"
        ${paginaActual===total?'disabled':''}>
            ▶
        </button>

    `;

}

function cambiarPagina(pagina){


    const total =Math.ceil(listaPosteos.length / tamanioPagina);


    if(pagina < 1 || pagina > total)
        return;


    paginaActual = pagina;


    mostrarPosteosPaginado();

}

function mostrarTrack(ruta, placa, fecha) {

    const url =
    `map.html?ruta=${encodeURIComponent(ruta)}&placa=${encodeURIComponent(placa)}&fecha=${encodeURIComponent(fecha)}`;


    console.log("MAP URL:", url);


    document.getElementById("mapFrame").src = url;


    document.getElementById("mapContainer").style.display = "";


    buscarPosteos(ruta, placa, fecha);


    document.getElementById("mapContainer")
        .scrollIntoView({
            behavior:"smooth"
        });

}


function formatearFecha(fecha) {

    if (!fecha) return "";

    return new Date(fecha).toLocaleString("es-PE");

}

function irATrama(lat, lng){

    const frame = document.getElementById("mapFrame");

    if(frame.contentWindow){

        frame.contentWindow.irATrama(lat, lng);

    }

}
