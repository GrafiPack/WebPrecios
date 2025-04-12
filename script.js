const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

const encabezadosPorCategoria = {
  "Folletos": {
    Precio1: "1000 u.",
    Precio2: "3000 u.",
    Precio3: "5000 u."
  },
  "Tarjetas": {
    Precio1: "1000 tarjetas",
    Precio2: "2000 tarjetas",
    Precio3: "5000 tarjetas"
  }
};

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("precios-container");
    const dataFiltrada = data.filter(row => row.Categoría !== "Categoría");

    const grouped = {};
    dataFiltrada.forEach(row => {
      const categoria = row['Categoría'] || "Sin categoría";
      const subcategoria = row['Subcategoría'] || "Sin subcategoría";

      if (!grouped[categoria]) grouped[categoria] = {};
      if (!grouped[categoria][subcategoria]) grouped[categoria][subcategoria] = [];

      grouped[categoria][subcategoria].push(row);
    });

    for (const categoria in grouped) {
      // Crear el título de categoría UNA VEZ antes de recorrer subcategorías
      const catEl = document.createElement("div");
      catEl.className = "category-title";
      
      // Título de la categoría
      const categoryTitle = document.createElement("span");
      categoryTitle.textContent = categoria;
      catEl.appendChild(categoryTitle);

      // Agregar la observación si existe
      const obs = grouped[categoria]["Sin subcategoría"]?.[0]?.Obs || ""; // Extraemos la observación de la primera fila
      if (obs) {
        const obsEl = document.createElement("span");
        obsEl.className = "category-obs";
        obsEl.textContent = obs;
        catEl.appendChild(obsEl);
      }

      container.appendChild(catEl);

      for (const subcategoria in grouped[categoria]) {
        const productos = grouped[categoria][subcategoria];

        const columnasPrecio = Object.keys(productos[0])
          .filter(key => key.startsWith("Precio"))
          .filter(key => productos.some(p => p[key] && p[key].trim() !== ""));

        const wrapper = document.createElement("div");
        wrapper.className = "table-container";

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        const thSubcat = document.createElement("th");
        thSubcat.textContent = subcategoria;
        headerRow.appendChild(thSubcat);

        columnasPrecio.forEach(col => {
          const th = document.createElement("th");
          const encabezadoPersonalizado = encabezadosPorCategoria[categoria]?.[col];
          th.textContent = encabezadoPersonalizado || col;
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

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
