const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const sheetURL = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

// Define las columnas variables por categoría
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
  },
  error: function() {
    document.getElementById("error-message").style.display = "block";
  }
});

function renderData(data) {
  const container = document.getElementById("precios-container");
  const agrupado = {};

  data.forEach(item => {
    const cat = item["Categoría"].trim();
    const sub = item["Subcategoría"].trim();
    if (!agrupado[cat]) agrupado[cat] = {};
    if (!agrupado[cat][sub]) agrupado[cat][sub] = [];
    agrupado[cat][sub].push(item);
  });

  for (const categoria in agrupado) {
    const catDiv = document.createElement("div");
    catDiv.className = "category-title";
    catDiv.textContent = categoria;
    container.appendChild(catDiv);

    const columnas = columnasPorCategoria[categoria] || [];

    for (const subcategoria in agrupado[categoria]) {
      const subDiv = document.createElement("div");
      subDiv.className = "subcategory-title";
      subDiv.textContent = subcategoria;
      container.appendChild(subDiv);

      const tableContainer = document.createElement("div");
      tableContainer.className = "table-container";

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");

      const thCantidad = document.createElement("th");
      thCantidad.textContent = "Cantidad";
      headerRow.appendChild(thCantidad);

      columnas.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      agrupado[categoria][subcategoria].forEach(item => {
        const row = document.createElement("tr");

        const tdCantidad = document.createElement("td");
        tdCantidad.textContent = item["Cantidad"]?.trim() || "-";
        row.appendChild(tdCantidad);

        columnas.forEach(col => {
          const td = document.createElement("td");
          td.textContent = item[col]?.trim() || "-";
          row.appendChild(td);
        });

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      tableContainer.appendChild(table);
      container.appendChild(tableContainer);
    }
  }
}
