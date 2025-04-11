const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

// Mapas de nombres personalizados para columnas por categoría
const encabezadosPorCategoria = {
  "Folletos": {
    Precio1: "Tamaño A6",
    Precio2: "Tamaño A5",
    Precio3: "Tamaño A4"
  },
  "Tarjetas Personales": {
    Precio1: "Frente",
    Precio2: "Doble faz",
    Precio3: "Con laminado"
  },
  // Agregá más categorías acá según tus necesidades
};

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

          // Usar encabezado personalizado si existe
          const encabezadoPersonalizado = encabezadosPorCategoria[categoria]?.[col] || col;
          th.textContent = encabezadoPersonalizado;

          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);
