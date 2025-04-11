const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("precios-container");

    const grouped = {};

    data.forEach(row => {
      const categoria = row["Categoría"]?.trim() || "Sin categoría";
      const subcategoria = row["Subcategoría"]?.trim() || "Sin subcategoría";

      if (!grouped[categoria]) {
        grouped[categoria] = {};
      }
      if (!grouped[categoria][subcategoria]) {
        grouped[categoria][subcategoria] = [];
      }

      grouped[categoria][subcategoria].push({
        detalle: row["Detalle"] || "-",
        precio1: row["Precio1"] || "-",
        precio2: row["Precio2"] || "-",
        precio3: row["Precio3"] || "-"
      });
    });

    for (const categoria in grouped) {
      const catEl = document.createElement("div");
      catEl.className = "categoria category-title";
      catEl.textContent = categoria;
      container.appendChild(catEl);

      for (const subcategoria in grouped[categoria]) {
        const subcatEl = document.createElement("div");
        subcatEl.className = "subcategoria subcategory-title";
        subcatEl.textContent = subcategoria;
        container.appendChild(subcatEl);

        // Encabezado
        const header = document.createElement("div");
        header.className = "item-row encabezado";
        ["Detalle", "Precio1", "Precio2", "Precio3"].forEach(title => {
          const cell = document.createElement("div");
          cell.className = "item-cell";
          cell.textContent = title;
          header.appendChild(cell);
        });
        container.appendChild(header);

        // Datos
        grouped[categoria][subcategoria].forEach(item => {
          const row = document.createElement("div");
          row.className = "item-row";

          [item.detalle, item.precio1, item.precio2, item.precio3].forEach(value => {
            const cell = document.createElement("div");
            cell.className = "item-cell";
            cell.textContent = value;
            row.appendChild(cell);
          });

          container.appendChild(row);
        });
      }
    }
  })
  .catch((error) => {
    console.error("Error al cargar los datos:", error);
    document.getElementById("precios-container").innerHTML = `
      <p style="color:red;">No se pudieron cargar los datos. Verificá el enlace de la hoja de cálculo.</p>
    `;
  });
