document.addEventListener('DOMContentLoaded', async () => {
  // 0) Aseguramos que PRECIOS_GENERALES esté cargado
  if (typeof PRECIOS_GENERALES === 'undefined' || !PRECIOS_GENERALES) {
    console.log('Cargando PRECIOS_GENERALES...');
    PRECIOS_GENERALES = await cargarPreciosGenerales();
  }
  const configGlobal = PRECIOS_GENERALES.planchas;
  if (!configGlobal) {
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

  // Nuevos: para rangos dinámicos de errores
  const minAnchoText     = document.getElementById('minAnchoText');
  const maxAnchoText     = document.getElementById('maxAnchoText');
  const minAltoText      = document.getElementById('minAltoText');
  const maxAltoText      = document.getElementById('maxAltoText');

  const canvas           = document.getElementById('previewCanvas');

  // 2) Mostrar valores máximos y mínimos

  minAnchoText.textContent = configGlobal.anchoMinimo;
  maxAnchoText.textContent = configGlobal.anchoMaximo;
  minAltoText.textContent  = configGlobal.altoMinimo;
  maxAltoText.textContent  = configGlobal.altoMaximo;

  // Setear límites de los inputs
  anchoInput.min = configGlobal.anchoMinimo;
  anchoInput.max = configGlobal.anchoMaximo;
  altoInput.min  = configGlobal.altoMinimo;
  altoInput.max  = configGlobal.altoMaximo;
  anchoInput.value = configGlobal.anchoMinimo;
  altoInput.value  = configGlobal.altoMinimo;

  const anchoPlancha = configGlobal.anchoMaximo;
  const altoPlancha  = configGlobal.altoMaximo;

// Fijar el ancho del canvas
const canvasWidth = 600;
canvas.width = canvasWidth;

// Calcular la escala y el alto proporcional
const escala = canvasWidth / anchoPlancha;
const canvasHeight = Math.round(altoPlancha * escala);
canvas.height = canvasHeight;


// 3) Mostrar el título del pliego
const tituloPliego = document.getElementById('tituloPliego');
if (tituloPliego) {
  tituloPliego.textContent = `Medida del la plancha: ${anchoPlancha} mm × ${altoPlancha} mm`;
}

  // 4) Validación de dimensión
  function validarDimension(valor, minimo, maximo) {
    return !(isNaN(valor) || valor < minimo || valor > maximo);
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
    const cols = Math.floor(anchoPlancha / w);
    const rows = Math.floor(altoPlancha / h);
    return { total: cols * rows, columnas: cols, filas: rows };
  }

  // 7) Dibujo en canvas
  function dibujarPreview(filas, columnas, w, h) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const espacio = 10;
    const margin = 10;
    const bloqueW = columnas * w + (columnas - 1) * espacio + 2 * margin;
    const bloqueH = filas    * h + (filas - 1)    * espacio + 2 * margin;
    const escala = Math.min(canvas.width / bloqueW, canvas.height / bloqueH);
    const totalW = columnas * w + (columnas - 1) * espacio;
    const totalH = filas    * h + (filas - 1)    * espacio;
    const offsetX = (canvas.width  - totalW * escala) / 2;
    const offsetY = (canvas.height - totalH * escala) / 2;

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

    if (!validarDimension(ancho, configGlobal.anchoMinimo, configGlobal.anchoMaximo)) {
      anchoInput.classList.add('is-invalid'); errorAncho.classList.remove('d-none');
      resultadoPrecio.textContent = '$ 0'; infoPlanchas.textContent=''; clearCanvas(); return;
    }
    anchoInput.classList.remove('is-invalid'); errorAncho.classList.add('d-none');

    if (!validarDimension(alto, configGlobal.altoMinimo, configGlobal.altoMaximo)) {
      altoInput.classList.add('is-invalid'); errorAlto.classList.remove('d-none');
      resultadoPrecio.textContent = '$ 0'; infoPlanchas.textContent=''; clearCanvas(); return;
    }
    altoInput.classList.remove('is-invalid'); errorAlto.classList.add('d-none');

    if (isNaN(qty) || qty <= 0) {
      resultadoPrecio.textContent = '$ 0'; infoPlanchas.textContent=''; clearCanvas(); return;
    }

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
    const factor  = configGlobal.factoresCantidad
      .filter(f=>qty>=f.min)
      .sort((a,b)=>b.min-a.min)[0]?.factor || 1;

    const areaM2 = (anchoPlancha/1000)*(altoPlancha/1000);
    const costoPlancha = mejor.total*configGlobal.precioFijoUnidad + areaM2*configGlobal.precioPorM2;
    const total     = configGlobal.precioFijo + costoPlancha * planchas * factor;

    resultadoPrecio.textContent = '$ ' + Math.round(total).toLocaleString('es-AR');
    const precioUnitario = document.getElementById('precioUnitario');
    if (precioUnitario && qty > 0) {
      const unitario = total / mejor.total;
      precioUnitario.textContent = `($${unitario.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/u)`;
    }
    infoPlanchas.innerHTML = `
      Stickers x plancha: <b>${mejor.total}</b> (filas ${mejor.filas} × columnas ${mejor.columnas})<br>
    `;
    dibujarPreview(mejor.filas, mejor.columnas, 
      mejor === normal ? sw : sh, mejor === normal ? sh : sw);
  }

  // 9) Eventos
  anchoInput.addEventListener('input', calcularPrecio);
  altoInput.addEventListener('input', calcularPrecio);
  cantidadInput.addEventListener('input', calcularPrecio);
  document.querySelectorAll('input[name="troquel"]').forEach(i =>
    i.addEventListener('change', calcularPrecio)
  );

  // Inicial
  clearCanvas();
  calcularPrecio();
});
