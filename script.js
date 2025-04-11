const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("precios-container");

    const grouped = {};

    data.forEach(row => {
      const categoria = row.Categoria || "Sin categoría";
      const subcategoria = row.Subcategoria || "Sin subcategoría";

      if (!grouped[categoria]) {
        grouped[categoria] = {};
      }
      if (!grouped[categoria][subcategoria]) {
        grouped[categoria][subcategoria] = [];
      }

      grouped[categoria][subcategoria].push({
        producto: row.Producto,
        precio: row.Precio
      });
    });

    for (const categoria in grouped) {
      const catEl = document.createElement("div");
      catEl.className = "categoria";
      catEl.textContent = categoria;
      container.appendChild(catEl);

      for (const subcategoria in grouped[categoria]) {
        const subcatEl = document.createElement("div");
        subcatEl.className = "subcategoria";
        subcatEl.textContent = subcategoria;
        container.appendChild(subcatEl);

        grouped[categoria][subcategoria].forEach(item => {
          const prod = document.createElement("div");
          prod.className = "producto";
          prod.innerHTML = `
            <div>${item.producto}</div>
            <div>$${item.precio}</div>
          `;
          container.appendChild(prod);
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
