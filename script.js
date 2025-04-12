// === CONFIGURACIÓN ===
const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

// === FUNCIÓN PRINCIPAL ===
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
      const catEl = document.createElement("div");
      catEl.className = "category-title";

      const catText = document.createElement("span");
      catText.textContent = categoria;
      catEl.appendChild(catText);

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

      if (obs) {
        const obsEl = document.createElement("span");
        obsEl.className = "category-obs";
        obsEl.textContent = obs;
        catEl.appendChild(obsEl);
      }

      container.appendChild(catEl);

      for (const subcategoria in grouped[categoria]) {
        const productos = grouped[categoria][subcategoria];
        const encabezados = productos[0]["Encabezados"];
        const encabezadosArray = encabezados
          ? encabezados.split(",").map(header => header.trim())
          : [];

        const wrapper = document.createElement("div");
        wrapper.className = "table-container";

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        const thSubcat = document.createElement("th");
        thSubcat.textContent = subcategoria;
        headerRow.appendChild(thSubcat);

        const columnasPrecio = Object.keys(productos[0])
          .filter(key => key.startsWith("Precio"))
          .filter(key => productos.some(p => p[key] && p[key].trim() !== ""));

        columnasPrecio.forEach((col, index) => {
          const th = document.createElement("th");
          const encabezadoPersonalizado = encabezadosArray[index] || "Nota";
          th.textContent = encabezadoPersonalizado;

          // Alinea el th si es "Nota"
          if (th.textContent.toLowerCase() === "nota") {
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

          columnasPrecio.forEach((col, index) => {
            const td = document.createElement("td");
            td.textContent = prod[col] || "";

            const encabezado = encabezadosArray[index] || "Nota";
            if (encabezado.toLowerCase() === "nota") {
              td.style.textAlign = "left";
              td.style.fontStyle = "italic";
              td.style.color = "#333";
            }

            tr.appendChild(td);
          });

          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        wrapper.appendChild(table);
        container.appendChild(wrapper);

        alinearNotas(wrapper);
      }
    }
  })
  .catch((error) => {
    console.error("Error al cargar los datos:", error);
    document.getElementById("precios-container").innerHTML = `
      <p style="color:red;">No se pudieron cargar los datos. Verificá el enlace de la hoja de cálculo.</p>
    `;
  });

// Alinea celdas que dicen "Nota" en la primera columna
function alinearNotas(wrapper) {
  wrapper.querySelectorAll("td:first-child").forEach(td => {
    const texto = td.textContent.trim().toLowerCase();
    if (texto.startsWith("nota")) {
      td.style.textAlign = "left";
      td.style.fontStyle = "italic";
      td.style.color = "#333";
    }
  });
}

