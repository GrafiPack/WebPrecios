const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("precios-container");

    // Agrupar por categoría y subcategoría
    const grouped = {};
    data.forEach(row => {
      const categoria = row.Categoría || "Sin Categoría";
      const subcategoria = row.Subcategoría || "General";

      if (!grouped[categoria]) grouped[categoria] = {};
      if (!grouped[categoria][subcategoria]) grouped[categoria][subcategoria] = [];
      grouped[categoria][subcategoria].push(row);
    });

    // Renderizar
    for (const categoria in grouped) {
      const catTitle = document.createElement("div");
      catTitle.className = "category-title";
      catTitle.textContent = categoria;
      container.appendChild(catTitle);

      for (const subcategoria in grouped[categoria]) {
        const subTitle = document.createElement("div");
        subTitle.className = "subcategory-title";
        subTitle.textContent = subcategoria;
        container.appendChild(subTitle);

        const table = document.createElement("div");
        table.className = "table";

        // Agregar encabezado
        const header = document.createElement("div");
        header.className = "table-row";
        const sample = grouped[categoria][subcategoria][0];
        for (const key in sample) {
          if (key !== "Categoría" && key !== "Subcategoría") {
            const cell = document.createElement("div");
            cell.textContent = key;
            header.appendChild(cell);
          }
        }
        table.appendChild(header);

        // Agregar filas
        grouped[categoria][subcategoria].forEach(row => {
          const rowDiv = document.createElement("div");
          rowDiv.className = "table-row";
          for (const key in row) {
            if (key !== "Categoría" && key !== "Subcategoría") {
              const cell = document.createElement("div");
              cell.textContent = row[key];
              rowDiv.appendChild(cell);
            }
          }
          table.appendChild(rowDiv);
        });

        container.appendChild(table);
      }
    }
  })
  .catch(err => {
    console.error("Error al cargar los datos:", err);
    document.getElementById("precios-container").innerHTML =
      "<p style='color:red'>No se pudieron cargar los datos.</p>";
  });
