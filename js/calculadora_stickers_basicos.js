// js/calculadora_stickers_semitroquelados.js

let configGlobal = null;

/**
 * Valida si una dimensión está dentro del rango permitido.
 */
function validarDimension(valor, minimo, maximo) {
  return !(isNaN(valor) || valor < minimo || valor > maximo);
}

/**
 * Genera los radios de cantidad y marca el valor mínimo como checked.
 */
function generarRadiosCantidad(cantidades, cantidadDefault) {
  const contenedor = document.getElementById('contenedorRadiosCantidad');
  contenedor.innerHTML = '';
  cantidades.forEach(c => {
    const id = 'cantidad' + c;
    contenedor.innerHTML += `
      <input type="radio" class="btn-check" name="cantidad" id="${id}" value="${c}" ${c === cantidadDefault ? 'checked' : ''}>
      <label class="btn btn-outline-secondary" for="${id}">${c}</label>
    `;
  });
}

/**
 * Inicializa la calculadora con la configuración cargada.
 */
function iniciarCalculo(config) {
  const section = document.querySelector('section[data-producto]');
  const nombreProducto = section?.dataset.producto?.trim() || "Producto";
  configGlobal = { ...config, nombreProducto };

  // Sacamos cantidades de la config
  const cantidadesDisponibles = config.factoresCantidad.map(f => f.min).sort((a, b) => a - b);
  const cantidadMinima = cantidadesDisponibles[0] || 10;
  configGlobal.cantidadMinima = cantidadMinima;

  // Generamos radios usando esa cantidad mínima como default
  generarRadiosCantidad(cantidadesDisponibles, cantidadMinima);

  // Referencias a elementos del DOM
  const anchoInput = document.getElementById('ancho');
  const altoInput  = document.getElementById('alto');
  const cantidadInput = document.getElementById('cantidadPersonalizada');
  const resultadoPrecio = document.getElementById('resultadoPrecio');
  const precioUnitario  = document.getElementById('precioUnitario');
  const errorMinimo  = document.getElementById('errorMinimo');
  const errorMultiplo = document.getElementById('errorMultiplo');
  const errorAncho = document.getElementById('errorAncho');
  const errorAlto  = document.getElementById('errorAlto');

  // Configurar rangos dinámicos
  anchoInput.min = config.anchoMinimo;
  anchoInput.max = config.anchoMaximo;
  altoInput.min  = config.altoMinimo;
  altoInput.max  = config.altoMaximo;
  anchoInput.value = config.anchoMinimo;
  altoInput.value  = config.altoMinimo;

  // Mostrar rangos en mensajes de error
  document.getElementById('minAnchoText').textContent = config.anchoMinimo;
  document.getElementById('maxAnchoText').textContent = config.anchoMaximo;
  document.getElementById('minAltoText').textContent  = config.altoMinimo;
  document.getElementById('maxAltoText').textContent  = config.altoMaximo;

  /**
   * Calcula y actualiza el precio.
   */
  function calcularPrecio() {
    const ancho = parseFloat(anchoInput.value);
    const alto  = parseFloat(altoInput.value);

    // Validar dimensiones
    if (!validarDimension(ancho, config.anchoMinimo, config.anchoMaximo)) {
      anchoInput.classList.add('is-invalid');
      errorAncho.classList.remove('d-none');
      return resetPrecio();
    }
    anchoInput.classList.remove('is-invalid');
    errorAncho.classList.add('d-none');

    if (!validarDimension(alto, config.altoMinimo, config.altoMaximo)) {
      altoInput.classList.add('is-invalid');
      errorAlto.classList.remove('d-none');
      return resetPrecio();
    }
    altoInput.classList.remove('is-invalid');
    errorAlto.classList.add('d-none');

    // Validar cantidad
    let cantidad;
    errorMinimo.classList.add('d-none');
    errorMultiplo.classList.add('d-none');
    if (cantidadInput.value.trim()) {
      cantidad = parseInt(cantidadInput.value, 10);
      if (cantidad < 10) {
        // Mostrar mensaje: cantidad mínima es 10
        errorMinimo.classList.remove('d-none');
        cantidadInput.classList.add('is-invalid');
        return resetPrecio();
      }
      if (cantidad % 10 !== 0) {
        // Mostrar mensaje: debe ser múltiplo de 10
        errorMultiplo.classList.remove('d-none');
        cantidadInput.classList.add('is-invalid');
        return resetPrecio();
      }

              // Si es válido, ocultar errores y quitar is-invalid
        errorMinimo.classList.add('d-none');
        errorMultiplo.classList.add('d-none');
      cantidadInput.classList.remove('is-invalid');
      
      // Deseleccionar radios si se ingresó cantidad personalizada
      document.querySelectorAll('input[name="cantidad"]').forEach(r => r.checked = false);
    } else {
      cantidad = parseInt(
        document.querySelector('input[name="cantidad"]:checked')?.value || configGlobal.cantidadMinima,
        10
      );
    }

    // Calcular área (mm → m): sumando margen 10mm
    const areaSticker = ((ancho + 10) / 1000) * ((alto + 10) / 1000);

    // Calcular factor (desde 50 aplica factor, menores = 1)
    let factor = 1;
    if (cantidad >= 50) {
      factor = config.factoresCantidad
        .filter(f => cantidad >= f.min)
        .sort((a, b) => b.min - a.min)[0]?.factor || 1;
    }

    // Fórmula final
    const precioTotal = (config.precioFijo
      + areaSticker * cantidad * config.precioPorM2 
      + config.precioFijoUnidad * cantidad) * factor;

    resultadoPrecio.textContent = "$ " + Math.round(precioTotal).toLocaleString("es-AR");
    precioUnitario.textContent  = "$ " + (precioTotal / cantidad).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " (c/u)";

    resultadoPrecio.dataset.precioTotal    = precioTotal;
    resultadoPrecio.dataset.precioUnitario = precioTotal / cantidad;
    resultadoPrecio.dataset.cantidad       = cantidad;
  }

  function resetPrecio() {
    resultadoPrecio.textContent = "$ 0";
    precioUnitario.textContent  = "";
    delete resultadoPrecio.dataset.precioTotal;
    delete resultadoPrecio.dataset.precioUnitario;
    delete resultadoPrecio.dataset.cantidad;
  }

  function registrarEventosRadiosCantidad() {
    document.querySelectorAll('input[name="cantidad"]').forEach(r =>
      r.addEventListener('change', () => {
        cantidadInput.value = '';
        cantidadInput.classList.remove('is-invalid'); // Quita borde rojo
      errorMinimo.classList.add('d-none');          // Oculta error mínimo
      errorMultiplo.classList.add('d-none');        // Oculta error múltiplo
        calcularPrecio();
      })
    );
  }

  // Eventos
  anchoInput.addEventListener('input', calcularPrecio);
  altoInput.addEventListener('input', calcularPrecio);
  cantidadInput.addEventListener('input', calcularPrecio);

  calcularPrecio(); // cálculo inicial

  document.getElementById('btnAgregarCarrito').addEventListener('click', () => {
    const precioTotal = parseFloat(resultadoPrecio.dataset.precioTotal);
    const precioUnit  = parseFloat(resultadoPrecio.dataset.precioUnitario);
    const cantidadGuardada = parseInt(resultadoPrecio.dataset.cantidad, 10);

    if (precioTotal > 0 && cantidadGuardada > 0) {
      window.agregarAlCarrito({
        producto: configGlobal.nombreProducto,
        ancho: anchoInput.value,
        alto: altoInput.value,
        cantidad: cantidadGuardada,
        precioUnitario: precioUnit,
        precioTotal: precioTotal
      });
    } else {
      alert("No hay un precio válido para agregar al carrito.");
    }
  });

  window.registrarEventosRadiosCantidad = registrarEventosRadiosCantidad;
}

/* // Carga inicial
document.addEventListener('DOMContentLoaded', async () => {
  PRECIOS_GENERALES = await cargarPreciosGenerales();
  const cfg = PRECIOS_GENERALES?.troquelados;
  if (!cfg) return alert("Error cargando configuración de precios.");
  iniciarCalculo(cfg);
  registrarEventosRadiosCantidad();
});
 */