// js/calculadora_stickers_plancha.js

// Constantes máximas para dimensiones
const MAX_ANCHO = 510;
const MAX_ALTO  = 980;

// Dimensiones de la plancha en mm
const PLANCHA_ANCHO = 980;
const PLANCHA_ALTO  = 510;

document.addEventListener('DOMContentLoaded', async () => {
  // 0) Aseguramos que PRECIOS_GENERALES esté cargado
  if (typeof PRECIOS_GENERALES === 'undefined' || !PRECIOS_GENERALES) {
    console.log('Cargando PRECIOS_GENERALES...');
    PRECIOS_GENERALES = await cargarPreciosGenerales();
  }
  const config = PRECIOS_GENERALES.planchas;
  if (!config) {
    return console.error('No existe configuración para "planchas" en PRECIOS_GENERALES');
  }

  // 1) Referencias al DOM
  const anchoInput       = document.getElementById('ancho');
  const altoInput        = document.getElementById('alto');
  const cantidadInput    = document.getElementById('cantidad');
  const resultadoPrecio  = document.getElementById('resultadoPrecio');
  const infoPlanchas     = document.getElementById('infoPlanchas');
  const errorAncho       = document.getElementById('errorAncho');
  const errorAlto        = document.getElementById('errorAlto');
  const maxAnchoSpan     = document.getElementById('maxAncho');
  const maxAltoSpan      = document.getElementById('maxAlto');
  const canvas           = document.getElementById('previewCanvas');

  // 2) Mostrar valores máximos
  maxAnchoSpan.textContent = MAX_ANCHO;
  maxAltoSpan.textContent  = MAX_ALTO;

  // 3) Debug canvas
  console.log('Canvas encontrado:', canvas, 'size:', canvas?.width, '×', canvas?.height);

  // 4) Validación de dimensión
  function validarDimension(valor, maximo) {
    return !(isNaN(valor) || valor < 20 || valor > maximo);
  }

  // 5) Limpiar canvas
  function clearCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 6) Cálculo de cuántos stickers caben
  function cantidadStickers(w, h) {
    const cols = Math.floor(PLANCHA_ANCHO / w);
    const rows = Math.floor(PLANCHA_ALTO / h);
    return { total: cols * rows, columnas: cols, filas: rows };
  }

  // 7) Dibujo en canvas
  function dibujarPreview(filas, columnas, w, h) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const espacio = 10; // mm entre stickers
    const margin = 10;  // mm de margen
    const bloqueW = columnas * w + (columnas - 1) * espacio + 2 * margin;
    const bloqueH = filas    * h + (filas - 1)    * espacio + 2 * margin;
    const escala = Math.min(canvas.width / bloqueW, canvas.height / bloqueH);
    console.log('bloqueW,H, escala:', bloqueW, bloqueH, escala);

    const totalW = columnas * w + (columnas - 1) * espacio;
    const totalH = filas    * h + (filas - 1)    * espacio;
    const offsetX = (canvas.width  - totalW * escala) / 2;
    const offsetY = (canvas.height - totalH * escala) / 2;

    // fondo
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#f97805';
    ctx.setLineDash([4,2]);
    ctx.lineWidth = 1;

    const tipo = document.querySelector('input[name="troquel"]:checked')?.value || 'recto';

    for (let r = 0; r < filas; r++) {
      for (let c = 0; c < columnas; c++) {
        const x = offsetX + c * (w + espacio) * escala;
        const y = offsetY + r * (h + espacio) * escala;
        const ww = w * escala;
        const hh = h * escala;

        if (tipo === 'circular') {
          ctx.beginPath();
          ctx.ellipse(x + ww/2, y + hh/2, ww/2, hh/2, 0, 0, 2*Math.PI);
          ctx.stroke();
        } else {
          ctx.strokeRect(x, y, ww, hh);
        }
      }
    }
    ctx.setLineDash([]);
  }

  // 8) Función principal
  function calcularPrecio() {
    const ancho = parseFloat(anchoInput.value);
    const alto  = parseFloat(altoInput.value);
    const qty   = parseInt(cantidadInput.value, 10);

    // Validar
    if (!validarDimension(ancho, MAX_ANCHO)) {
      anchoInput.classList.add('is-invalid'); errorAncho.classList.remove('d-none');
      resultadoPrecio.textContent = '$ 0'; infoPlanchas.textContent=''; clearCanvas(); return;
    }
    anchoInput.classList.remove('is-invalid'); errorAncho.classList.add('d-none');
    if (!validarDimension(alto, MAX_ALTO)) {
      altoInput.classList.add('is-invalid'); errorAlto.classList.remove('d-none');
      resultadoPrecio.textContent = '$ 0'; infoPlanchas.textContent=''; clearCanvas(); return;
    }
    altoInput.classList.remove('is-invalid'); errorAlto.classList.add('d-none');
    if (isNaN(qty) || qty <= 0) {
      resultadoPrecio.textContent = '$ 0'; infoPlanchas.textContent=''; clearCanvas(); return;
    }

    // Agregar margen al sticker
    const sw = ancho + 10;
    const sh = alto  + 10;
    const normal = cantidadStickers(sw, sh);
    const rotada = cantidadStickers(sh, sw);
    const mejor  = rotada.total > normal.total ? rotada : normal;
    if (mejor.total === 0) {
      resultadoPrecio.textContent = '$ 0';
      infoPlanchas.textContent = 'No entran por tamaño';
      clearCanvas(); return;
    }

    const planchas = Math.ceil(qty / mejor.total);
    const factor  = config.factoresCantidad
      .filter(f=>qty>=f.min)
      .sort((a,b)=>b.min-a.min)[0]?.factor || 1;

    const areaM2 = (PLANCHA_ANCHO/1000)*(PLANCHA_ALTO/1000);
    const costoPlancha = mejor.total*config.precioFijoUnidad + areaM2*config.precioPorM2;
    const total     = config.precioFijo + costoPlancha * planchas * factor;

    // Mostrar
    resultadoPrecio.textContent = '$ ' + Math.round(total).toLocaleString('es-AR');
    infoPlanchas.innerHTML = `
      Stickers x plancha: <b>${mejor.total}</b> (filas ${mejor.filas} × columnas ${mejor.columnas})<br>
      
    `;
    dibujarPreview(mejor.filas, mejor.columnas, 
      mejor===normal?sw:sh, mejor===normal?sh:sw);
  }

  // 9) Eventos
  anchoInput.addEventListener('input', calcularPrecio);
  altoInput.addEventListener('input', calcularPrecio);
  cantidadInput.addEventListener('input', calcularPrecio);
  document.querySelectorAll('input[name="troquel"]').forEach(i=>
    i.addEventListener('change', calcularPrecio)
  );

  // Inicial
  clearCanvas();
  calcularPrecio();
});
