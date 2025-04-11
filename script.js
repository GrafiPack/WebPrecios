const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS89yGJk3Shd1vBqHZepjaHqddT1ONqH7eH7oAiS_fZk6UScTgRUgoMOljDjHufZuNT8B0qx9XeFdJ5/pub?output=csv";

const columnasPorCategoria = {
  "Folletos": ["Una cara", "Ambas caras"],
  "Stickers": ["Una cara", "Ambas caras"],
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
