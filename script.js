const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("precios-container");

    // Filtramos encabezado
    const dataFiltrada = data.filter(row => row.Categoría !== "Categoría");

    // Agrupar por Categoría > Subcategoría
    const grouped = {};

    dataFiltrada.forEach(row => {
      const categoria = row['Categoría'] || "Sin categoría";
      const subcategoria = row['Subcategoría'] || "Sin subcategoría";

      if (!grouped[categoria]) {
        grouped[categoria] = {};
      }

      if (!grouped[categoria][subcategoria]) {
        grouped[categoria][subcategoria] = [];
      }

      grouped[categoria][subcategoria].push(row);
    });

    // Recorremos Categorías
    for (const categoria in grouped) {
      const catEl = document.createElement("div");
      catEl.className = "category-title";
      catEl.textContent = categoria;
      container.appendChild(catEl);

      // Recorremos Subcategorías
      for (const subcategoria in grouped[categoria]) {
        const subcatEl = document.createElement("div");
        subcatEl.className = "subcategory-title";
        subcatEl.textContent = subcategoria;
        container.appendChild(subcatEl);

        const productos = grouped[categoria][subcategoria];

        // Detectar columnas PrecioX con al menos un valor
        const columnasPrecio = Object.keys(productos[0])
          .filter(key => key.startsWith("Precio"))
          .filter(key => productos.some(p => p[key] && p[key].trim() !== ""));

        // Crear tabla
        const table = document.createElement("table");

        // Encabezado
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        const thDetalle = document.createElement("th");
        thDetalle.textContent = "Detalle";
        headerRow.appendChild(thDetalle);

        columnasPrecio.forEach(col => {
          const th = document.createElement("th");
          th.textContent = col;
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Cuerpo
        const tbody = document.createElement("tbody");

        productos.forEach(prod => {
          const tr = document.createElement("tr");

          const tdDetalle = document.createElement("td");
          tdDetalle.textContent = prod.Detalle || "";
          tr.appendChild(tdDetalle);

          columnasPrecio.forEach(col => {
            const td = document.createElement("td");
            td.textContent = prod[col] || "";
            tr.appendChild(td);
          });

          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        const wrapper = document.createElement("div");
        wrapper.className = "table-container";
        wrapper.appendChild(table);
        container.appendChild(wrapper);
      }
    }
  })
  .catch((error) => {
    console.error("Error al cargar los datos:", error);
    document.getElementById("precios-container").innerHTML = `
      <p style="color:red;">No se pudieron cargar los datos. Verificá el enlace de la hoja de cálculo.</p>
    `;
  });
