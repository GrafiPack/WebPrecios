const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "stickers";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

const selectDiseno = document.getElementById("diseno");
const selectVinilo = document.getElementById("vinilo");
const selectTroquel = document.getElementById("troquel");

const inputAncho = document.getElementById("ancho");
const inputAlto = document.getElementById("alto");
const inputPliegos = document.getElementById("pliegos");

const stickersPorPliego = document.getElementById("stickers-por-pliego");
const totalStickers = document.getElementById("total-stickers");

const precioUnitario = document.getElementById("precio-unitario");
const precioUnitarioIva = document.getElementById("precio-unitario-iva");
const precioTotal = document.getElementById("precio-total");
const precioTotalIva = document.getElementById("precio-total-iva");

// ========================
// Cargar datos de la hoja
// ========================
fetch(url)
  .then(res => res.json())
  .then(data => {
    const disenos = data.filter(row => row.Subcategoría === "Diseño");
    const vinilos = data.filter(row => row.Subcategoría === "Vinilos");
    const troqueles = data.filter(row => row.Subcategoría === "Rotulado");

    fillSelect(selectDiseno, disenos);
    fillSelect(selectVinilo, vinilos);
    fillSelect(selectTroquel, troqueles);
  })
  .catch(error => {
    console.error("Error cargando datos:", error);
  });

// ========================
// Llenar combo con datos
// ========================
function fillSelect(select, items) {
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item.Detalle;
    option.textContent = item.Detalle;
    option.dataset.precio = parseFloat(item.Precio || "0");
    select.appendChild(option);
  });
}

// ========================
// Calcular precios
// ========================
function calcular() {
  const diseno = parseFloat(selectDiseno.selectedOptions[0]?.dataset.precio || 0);
  const vinilo = parseFloat(selectVinilo.selectedOptions[0]?.dataset.precio || 0);
  const troquel = parseFloat(selectTroquel.selectedOptions[0]?.dataset.precio || 0);
  const ancho = parseFloat(inputAncho.value) || 0;
  const alto = parseFloat(inputAlto.value) || 0;
  const pliegos = parseInt(inputPliegos.value) || 0;

  // Calcular cantidad de stickers por pliego (en cm)
  const cantidad1 = Math.floor(51 / (ancho + 1)) * Math.floor(98 / (alto + 1));
  const cantidad2 = Math.floor(51 / (alto + 1)) * Math.floor(98 / (ancho + 1));
  const stickers = Math.max(cantidad1, cantidad2);

  stickersPorPliego.textContent = stickers;
  totalStickers.textContent = stickers * pliegos;

  // Área del pliego en m²
  const areaPliego = 0.51 * 0.98;

  // Calcular precios
  const precioVinilo = pliegos * areaPliego * vinilo;
  const precioTroquel = pliegos * troquel;
  const precioDiseno = diseno;

  const total = precioVinilo + precioTroquel + precioDiseno;
  const stickersTotales = stickers * pliegos || 1;
  const unitario = total / stickersTotales;
  const iva = 0.21;

  // Mostrar resultados formateados
  precioUnitario.textContent = `$ ${formatNumber(Math.round(unitario))}`;
  precioUnitarioIva.textContent = `$ ${formatNumber(Math.round(unitario * (1 + iva)))}`;
  precioTotal.textContent = `$ ${formatNumber(Math.round(total))}`;
  precioTotalIva.textContent = `$ ${formatNumber(Math.round(total * (1 + iva)))}`;
}

// ========================
// Formatear números con puntos
// ========================
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ========================
// Escuchar cambios
// ========================
[selectDiseno, selectVinilo, selectTroquel, inputAncho, inputAlto, inputPliegos].forEach(el => {
  el.addEventListener("change", calcular);
});
