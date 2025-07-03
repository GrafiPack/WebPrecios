const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "stickers";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

const selectDiseno = document.getElementById('select-diseno');
const selectVinilo = document.getElementById('select-vinilo');
const selectTroquel = document.getElementById('select-troquel');

const inputAncho = document.getElementById('input-ancho');
const inputAlto = document.getElementById('input-alto');
const inputPliegos = document.getElementById('input-pliegos');

const stickersPorPliego = document.getElementById('stickers-por-pliego');
const totalStickers = document.getElementById('total-stickers');
const precioUnitario = document.getElementById('precio-unitario');
const precioUnitarioIva = document.getElementById('precio-unitario-iva');
const precioTotal = document.getElementById('precio-total');
const precioTotalIva = document.getElementById('precio-total-iva');

let precios = {
  diseno: {},
  vinilo: {},
  troquel: {}
};

// Cargar datos de la hoja
fetch(url)
  .then(res => res.json())
  .then(data => {
    data.forEach(row => {
      if (row.Subcategoría === 'Diseño') {
        const opt = new Option(row.Detalle, row.Detalle);
        opt.dataset.precio = parseFloat(row.Precio1.replace(/[^0-9.-]+/g, '')) || 0;
        selectDiseno.appendChild(opt);
        precios.diseno[row.Detalle] = opt.dataset.precio;
      }
      if (row.Subcategoría === 'Vinilos') {
        const opt = new Option(row.Detalle, row.Detalle);
        opt.dataset.precio = parseFloat(row.Precio1.replace(/[^0-9.-]+/g, '')) || 0;
        selectVinilo.appendChild(opt);
        precios.vinilo[row.Detalle] = opt.dataset.precio;
      }
      if (row.Subcategoría === 'Rotulado') {
        const opt = new Option(row.Detalle, row.Detalle);
        opt.dataset.precio = parseFloat(row.Precio1.replace(/[^0-9.-]+/g, '')) || 0;
        selectTroquel.appendChild(opt);
        precios.troquel[row.Detalle] = opt.dataset.precio;
      }
    });
    calcular();
  });

// Escuchar cambios
[selectDiseno, selectVinilo, selectTroquel, inputAncho, inputAlto, inputPliegos]
  .forEach(el => el.addEventListener('input', calcular));

// Función principal de cálculo
function calcular() {
  const diseno = parseFloat(selectDiseno.selectedOptions[0]?.dataset.precio || 0);
  const vinilo = parseFloat(selectVinilo.selectedOptions[0]?.dataset.precio || 0);
  const troquel = parseFloat(selectTroquel.selectedOptions[0]?.dataset.precio || 0);
  const ancho = parseFloat(inputAncho.value) || 0;
  const alto = parseFloat(inputAlto.value) || 0;
  const pliegos = parseInt(inputPliegos.value) || 0;

  // Calcular cuántos stickers entran en el pliego 51x98
  const cantidad1 = Math.floor(51 / (ancho + 1)) * Math.floor(98 / (alto + 1));
  const cantidad2 = Math.floor(51 / (alto + 1)) * Math.floor(98 / (ancho + 1));
  const stickers = Math.max(cantidad1, cantidad2);

  stickersPorPliego.textContent = stickers;
  totalStickers.textContent = stickers * pliegos;

  // Calcular precios
  const precioVinilo = pliegos * 51 * 0.98 * vinilo;
  const precioTroquel = pliegos * troquel;
  const precioDiseno = diseno;

  const total = precioVinilo + precioTroquel + precioDiseno;
  const unitario = total / (stickers * pliegos || 1);
  const iva = 0.21;

  // Formatear con separador de miles
  precioUnitario.textContent = `$ ${formatNumber(unitario)}`;
  precioUnitarioIva.textContent = `$ ${formatNumber(unitario * (1 + iva))}`;
  precioTotal.textContent = `$ ${formatNumber(total)}`;
  precioTotalIva.textContent = `$ ${formatNumber(total * (1 + iva))}`;
}
