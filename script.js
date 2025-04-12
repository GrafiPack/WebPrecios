const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("precios-container");

    if (!data || data.length === 0) {
      container.innerHTML = "<p>No se encontraron datos en la hoja de cálculo.</p>";
      return;
    }

    const dataFiltrada = data.filter(row => row.Categoría !== "Categoría");

    const grouped = {};
    dataFiltrada.forEach(row => {
      const categoria = row['Categoría'] || "Sin categoría";
      const subcategoria = row['Subcategoría'] || "Sin subcategoría";

      if (!grouped[categoria]) grouped[categoria] = {};
      if (!grouped[categoria][subcategoria]) grouped[categoria][subcategoria] = [];

      grouped[categoria][subcategoria].push(row);
    });

    if (Object.keys(grouped).length === 0) {
      container.innerHTML = "<p>No se encontraron categorías en los datos.</p>";
      return;
    }

    for (const categoria in grouped) {
      // Crear contenedor para el título de categoría y su observación
      const catEl = document.createElement("div");
      catEl.className = "category-title";

      // Crear texto de la categoría
      const catText = document.createElement("span");
      catText.textContent = categoria;
      catEl.appendChild(catText);

      // Buscar la primera observación disponible en la categoría
      let obs = "";
      for (const subcat in grouped[categoria]) {
        for (const prod of grouped[categoria][subcat]) {
          if (prod.Obs && prod.Obs.trim() !== "") {
            obs = prod.Obs.trim();
            break;
          }
        }
        if (obs) break;
      }

      // Si hay observación, agregarla
      if (obs) {
        const obsEl = document.createElement("span");
        obsEl.className = "category-obs";
        obsEl.textContent = obs;
        catEl.appendChild(obsEl);
      }

      container.appendChild(catEl);

      for (const subcategoria in grouped[categoria]) {
        const productos = grouped[categoria][subcategoria];

        // Obtener la columna "Encabezados" para reemplazar los encabezados de precios
        const encabezados = productos[0]["Encabezados"];
        const encabezadosArray = encabezados ? encabezados.split(",").map(header => header.trim()) : [];
        
        const wrapper = document.createElement("div");
        wrapper.className = "table-container";

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        const thSubcat = document.createElement("th");
        thSubcat.textContent = subcategoria;
        headerRow.appendChild(thSubcat);

        // Crear encabezados de precio, usando "Nota" si no hay encabezado disponible
        const columnasPrecio = Object.keys(productos[0])
          .filter(key => key.startsWith("Precio"))
          .filter(key => productos.some(p => p[key] && p[key].trim() !== ""));

        columnasPrecio.forEach((col, index) => {
          const th = document.createElement("th");
          const encabezadoPersonalizado = encabezadosArray[index] || "Nota";
          th.textContent = encabezadoPersonalizado;

          // Si el encabezado es "Nota", agregar clase para alineación a la izquierda
          if (th.textContent === "Nota") {
            th.classList.add("align-left");
          }
          
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

          // Crear las celdas de precio según los encabezados
          columnasPrecio.forEach(col => {
            const td = document.createElement("td");
            td.textContent = prod[col] || ""; // Dejar vacío si no hay valor
            // Si la celda está vacía y su encabezado es "Nota", aplicar alineación a la izquierda
            if (td.textContent === "" && encabezadosArray.includes("Nota")) {
              td.classList.add("align-left");
            }
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
