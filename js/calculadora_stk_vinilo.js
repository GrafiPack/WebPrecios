const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "stickers";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

// Elementos del DOM
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

// Función para limpiar precio
function convertirPrecio(valorCrudo) {
  if (!valorCrudo) return 0;
  const limpio = String(valorCrudo)
    .replace(/[^0-9,.-]+/g, '')  // quita $, espacios, etc.
    .replace(/\./g, '')          // quita puntos de miles
    .replace(',', '.');          // cambia coma decimal a punto
  return parseFloat(limpio) || 0;
}

// Formatear número con separador de miles
function formatNumber(num) {
  num = parseFloat(num) || 0;
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Cargar datos
fetch(url)
  .then(res => res.json())
  .then(data => {
    data.forEach(row => {
      const precio = convertirPrecio(row.Precio1);
      const detalle = row.Detalle || "Sin detalle";

      const opt = new Option(detalle, detalle);
      opt.dataset.precio = precio; // guarda valor numérico limpio

      if (row.Subcategoría === 'Diseño') selectDiseno.appendChild(opt);
      if (row.Subcategoría === 'Vinilos') selectVinilo.appendChild(opt);
      if (row.Subcategoría === 'Rotulado') selectTroquel.appendChild(opt);
    });

    selectDiseno.selectedIndex = 0;
    selectVinilo.selectedIndex = 0;
    selectTroquel.selectedIndex = 0;

    calcular();
  })
  .catch(err => {
    console.error("Error cargando datos de la hoja:", err);
  });

// Escuchar cambios
[
  selectDiseno,
  selectVinilo,
  selectTroquel,
  inputAncho,
  inputAlto,
  inputPliegos
].forEach(el => el.addEventListener('input', calcular));

// Calcular
function calcular() {
  const diseno = parseFloat(selectDiseno.selectedOptions[0]?.dataset.precio || 0);
  const vinilo = parseFloat(selectVinilo.selectedOptions[0]?.dataset.precio || 0);
  const troquel = parseFloat(selectTroquel.selectedOptions[0]?.dataset.precio || 0);
  const ancho = parseFloat(inputAncho.value) || 0;
  const alto = parseFloat(inputAlto.value) || 0;
  const pliegos = parseInt(inputPliegos.value) || 0;

  console.log("👉 Diseño:", diseno, "👉 Vinilo:", vinilo, "👉 Troquel:", troquel);

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

  const areaPliego = 0.51 * 0.98;
  const precioVinilo = pliegos * areaPliego * vinilo;
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
