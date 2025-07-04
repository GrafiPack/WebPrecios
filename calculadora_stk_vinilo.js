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
      let precio = parseFloat(
        (row.Precio1 || '').replace(/[^0-9,.-]+/g, '').replace(',', '.')
      ) || 0;

      if (row.Subcategoría === 'Diseño') {
        const opt = new Option(row.Detalle, row.Detalle);
        opt.dataset.precio = precio;
        selectDiseno.appendChild(opt);
        precios.diseno[row.Detalle] = precio;
      }

      if (row.Subcategoría === 'Vinilos') {
        const opt = new Option(row.Detalle, row.Detalle);
        opt.dataset.precio = precio;
        selectVinilo.appendChild(opt);
        precios.vinilo[row.Detalle] = precio;
      }

      if (row.Subcategoría === 'Rotulado') {
        const opt = new Option(row.Detalle, row.Detalle);
        opt.dataset.precio = precio;
        selectTroquel.appendChild(opt);
        precios.troquel[row.Detalle] = precio;
      }
    });
    calcular(); // calculamos al cargar
  })
  .catch(err => {
    console.error("Error cargando datos de la hoja:", err);
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

  if (ancho <= 0 || alto <= 0 || pliegos <= 0 || vinilo <= 0) {
    stickersPorPliego.textContent = totalStickers.textContent = "0";
    precioUnitario.textContent = precioUnitarioIva.textContent = "$ 0";
    precioTotal.textContent = precioTotalIva.textContent = "$ 0";
    return;
  }

  const cantidad1 = Math.floor(51 / (ancho + 1)) * Math.floor(98 / (alto + 1));
  const cantidad2 = Math.floor(51 / (alto + 1)) * Math.floor(98 / (ancho + 1));
  const stickers = Math.max(cantidad1, cantidad2);

  const total_stickers = stickers * pliegos;

  stickersPorPliego.textContent = stickers;
  totalStickers.textContent = total_stickers;

  const precioVinilo = pliegos * vinilo;
  const precioTroquel = pliegos * troquel;
  const precioDiseno = diseno;

  const total = precioVinilo + precioTroquel + precioDiseno;
  const unitario = total / (total_stickers || 1);
  const iva = 0.21;

  precioUnitario.textContent = `$ ${formatNumber(unitario)}`;
  precioUnitarioIva.textContent = `$ ${formatNumber(unitario * (1 + iva))}`;
  precioTotal.textContent = `$ ${formatNumber(total)}`;
  precioTotalIva.textContent = `$ ${formatNumber(total * (1 + iva))}`;
}

// Formatear número con separador de miles
function formatNumber(num) {
  num = parseFloat(num) || 0;
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
