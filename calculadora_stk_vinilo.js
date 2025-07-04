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
    calcular(); // calcular al cargar
  })
  .catch(err => {
    console.error("Error cargando datos de la hoja:", err);
  });

// Escuchar cambios
[selectDiseno, selectVinilo, s]()
