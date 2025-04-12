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

    // Filtrar títulos duplicados
    const dataFiltrada = data.filter(row => row.Categoría !== "Categoría");

    // Agrupar por categoría y subcategoría
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

    // === RECORRER CATEGORÍAS ===
    for (const categoria in grouped) {
      // Crear contenedor del título de categoría + observación
      const catEl = document.createElement("div");
      catEl.className = "category-title";

      const catText = document.createElement("span");
      catText.textContent = categoria;
      catEl.appendChild(catText);

      // Buscar primera observación disponible
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

      // Agregar observación si existe
      if (obs) {
        const obsEl = document.createElement("span");
        obsEl.className = "category-obs";
        obsEl.textContent = obs;
        catEl.appendChild(obsEl);
      }

      container.appendChild(catEl);

      // === RECORRER SUBCATEGORÍAS ===
      for (const subcategoria in grouped[categoria]) {
        const productos = grouped[categoria][subcategoria];

        // Obtener encabezados personalizados desde columna "Encabezados"
        const encabezados = productos[0]["Encabezados"];
        const encabezadosArray = encabezados
          ? encabezados.split(",").map(header => header.trim())
          : [];

        // Crear contenedor de la tabla
        const wrapper = document.createElement("div");
        wrapper.className = "table-container";

        // Crear tabla
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        // Celda de subcategoría (primer encabezado)
        const thSubcat = document.createElement("th");
        thSubcat.textContent = subcategoria;
        headerRow.appendChild(thSubcat);

        // Detectar columnas de precios con datos
        const columnasPrecio = Object.keys(productos[0])
          .filter(key => key.startsWith("Precio"))
          .filter(key => productos.some(p => p[key] && p[key].trim() !== ""));

        // Crear encabezados
        columnasPrecio.forEach((col, index) => {
          const th = document.createElement("th");
          const encabezadoPersonalizado = encabezadosArray[index] || "Nota";
          th.textContent = encabezadoPersonalizado;

          // Si es "
