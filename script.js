const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS89yGJk3Shd1vBqHZepjaHqddT1ONqH7eH7oAiS_fZk6UScTgRUgoMOljDjHufZuNT8B0qx9XeFdJ5/pub?output=csv";

const columnasPorCategoria = {
  "Folletos": ["Una cara", "Ambas caras"],
  "Stickers": ["Autoadhesivo", "Vinilo"],
  "Imanes": ["Clasicos", "Laminados"],
  "Volantes Blanco y Negro": ["Una cara", "Ambas caras"]
};

Papa.parse(sheetURL, {
  download: true,
  header: true,
  complete: function(results) {
    const data = results.data;
    renderData(data);
  }
});

function renderData(data) {
  const container = document.getElementById("precios-container");
  const agrupado = {};

  data.forEach(item => {
    const cat = item["Categoría"] || "Sin categoría";
    const sub = item["Subcategoría"] || "Sin subcategoría";
    if (!agrupado[cat]) agrupado[cat] = {};
    if (!agrupado[cat][sub]) agrupado[cat][sub] = [];
    agrupado[cat][sub].push(item);
  });

  for (const categoria in agrupado) {
    const catDiv = document.createElement("div");
    catDiv.className = "categoria";
    catDiv.textContent = categoria;
    container.appendChild(catDiv);

    const columnas = columnasPorCategoria[categoria] || ["Precio 1", "Precio 2"];

    for (const subcategoria in agrupado[categoria]) {
      const subDiv = document.createElement("div");
      subDiv.className = "subcategoria";
      subDiv.textContent = subcategoria;
      container.appendChild(subDiv);

      agrupado[categoria][subcategoria].forEach(item => {
        const row = document.createElement("div");
        row.className = "item-row";

        const detalle = document.createElement("div");
        detalle.className = "item-cell";
        detalle.textContent = item["Cantidad"] || "-";
        row.appendChild(detalle);

        columnas.forEach(col => {
          const celda = document.createElement("div");
          celda.className = "item-cell";
          celda.textContent = item[col] || "-";
          row.appendChild(celda);
        });

        container.appendChild(row);
      });
    }
  }
}
