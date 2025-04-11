const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("precios-container");
    
    const dataFiltrada = data.filter(row => row.Categoría !== "Categoría"); // Filtra la fila de encabezados

    const grouped = {};

    dataFiltrada.forEach(row => {
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
        precio1: row["Precio1"] || "",
        precio2: row["Precio2"] || "",
        precio3: row["Precio3"] || ""
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

        const items = grouped[categoria][subcategoria];

        // Verificar qué columnas mostrar
        const mostrarPrecio1 = items.some(item => item.precio1.trim() !== "");
        const mostrarPrecio2 = items.some(item => item.precio2.trim() !== "");
        const mostrarPrecio3 = items.some(item => item.precio3.trim() !== "");

        // Armamos encabezado dinámico
        const header = document.createElement("div");
        header.className = "item-row encabezado";

        const columnasAMostrar = ["Detalle"];
        if (mostrarPrecio1) columnasAMostrar.push("Precio1");
        if (mostrarPrecio2) columnasAMostrar.push("Precio2");
        if (mostrarPrecio3) columnasAMostrar.push("Precio3");

        columnasAMostrar.forEach(title => {
          const cell = document.createElement("div");
          cell.className = "item-cell";
          cell.textContent = title;
          header.appendChild(cell);
        });

        container.appendChild(header);

        // Filas de datos
        items.forEach(item => {
          const row = document.createElement("div");
          row.className = "item-row";

          columnasAMostrar.forEach(col => {
            const cell = document.createElement("div");
            cell.className = "item-cell";
            let value = "-";

            if (col === "Detalle") value = item.detalle;
            if (col === "Precio1") value = item.precio1 || "-";
            if (col === "Precio2") value = item.precio2 || "-";
            if (col === "Precio3") value = item.precio3 || "-";

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
