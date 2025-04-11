const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

fetch(url)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    const container = document.getElementById('precios-container');
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Formato inesperado de datos");
    }

    const groupedData = {};

    data.forEach(row => {
      const categoria = row.Categoría || "Sin categoría";
      const subcategoria = row.Subcategoría || "Sin subcategoría";

      if (!groupedData[categoria]) groupedData[categoria] = {};
      if (!groupedData[categoria][subcategoria]) groupedData[categoria][subcategoria] = [];

      groupedData[categoria][subcategoria].push(row);
    });

    for (const categoria in groupedData) {
      const catTitle = document.createElement('h2');
      catTitle.textContent = categoria;
      catTitle.className = 'category-title';
      container.appendChild(catTitle);

      const subcategorias = groupedData[categoria];
      for (const sub in subcategorias) {
        const subTitle = document.createElement('h3');
        subTitle.textContent = sub;
        subTitle.className = 'subcategory-title';
        container.appendChild(subTitle);

        const items = subcategorias[sub];
        if (items.length === 0) continue;

        const columnas = Object.keys(items[0]).filter(k => !["Categoría", "Subcategoría"].includes(k));

        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');

        columnas.forEach(col => {
          const th = document.createElement('th');
          th.textContent = col;
          trHead.appendChild(th);
        });

        thead.appendChild(trHead);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        items.forEach(item => {
          const tr = document.createElement('tr');
          columnas.forEach(col => {
            const td = document.createElement('td');
            td.textContent = item[col] || "";
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);
        container.appendChild(tableContainer);
      }
    }
  })
  .catch(err => {
    console.error("Error al cargar los datos:", err);
    document.getElementById('error-message').style.display = 'block';
  });
