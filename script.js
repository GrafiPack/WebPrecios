const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;
const columnasPorCategoria = {
  "Folletos": ["Una cara", "Ambas caras"],
  "Stickers": ["Redondos", "Cuadrados"],
  "Imanes": ["Una cara", "Ambas caras"],
  "Volantes Blanco y Negro": ["Una cara", "Ambas caras"]
};

Papa.parse(sheetURL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    const data = results.data.filter(row => row["Categoría"] && row["Subcategoría"]);
    renderData(data);
  }
});

function renderData(data) {
  const container = document.getElementById("precios-container");
  const agrupado = {};

  data.forEach(item => {
    const cat = item["Categoría"].trim() || "Sin categoría";
    const sub = item["Subcategoría"].trim() || "Sin subcategoría";
    if (!agrupado[cat]) agrupado[cat] = {};
    if (!agrupado[cat][sub]) agrupado[cat][sub] = [];
    agrupado[cat][sub].push(item);
  });

  for (const categoria in agrupado) {
    const catDiv = document.createElement("div");
    catDiv.className = "categoria";
    catDiv.textContent = categoria;
    container.appendChild(catDiv);

    const columnas = columnasPorCategoria[categoria] || [];

    for (const subcategoria in agrupado[categoria]) {
      const subDiv = document.createElement("div");
      subDiv.className = "subcategoria";
      subDiv.textContent = subcategoria;
      container.appendChild(subDiv);

      // Fila de encabezado
      const headerRow = document.createElement("div");
      headerRow.className = "item-row encabezado";

      const colDetalle = document.createElement("div");
      colDetalle.className = "item-cell";
      colDetalle.textContent = "Cantidad";
      headerRow.appendChild(colDetalle);

      columnas.forEach(col => {
        const celdaHeader = document.createElement("div");
        celdaHeader.className = "item-cell";
        celdaHeader.textContent = col;
        headerRow.appendChild(celdaHeader);
      });

      container.appendChild(headerRow);

      // Fila de datos
      agrupado[categoria][subcategoria].forEach(item => {
        const row = document.createElement("div");
        row.className = "item-row";

        const detalle = document.createElement("div");
        detalle.className = "item-cell";
        detalle.textContent = item["Cantidad"]?.trim() || "-";
        row.appendChild(detalle);

        columnas.forEach(col => {
          const celda = document.createElement("div");
          celda.className = "item-cell";
          celda.textContent = item[col]?.trim() || "-";
          row.appendChild(celda);
        });

        container.appendChild(row);
      });
    }
  }
}
