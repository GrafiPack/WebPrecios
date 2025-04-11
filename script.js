const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('precios-container');

    // Agrupar por categoría y subcategoría
    const agrupado = {};

    data.forEach(row => {
      const cat = row.Categoría?.trim();
      const sub = row.Subcategoría?.trim();

      if (!cat || !sub) return;

      if (!agrupado[cat]) agrupado[cat] = {};
      if (!agrupado[cat][sub]) agrupado[cat][sub] = [];

      agrupado[cat][sub].push(row);
    });

    // Generar HTML
    for (const categoria in agrupado) {
      const catDiv = document.createElement('div');
      catDiv.className = 'categoria';
      catDiv.textContent = categoria;
      container.appendChild(catDiv);

      const subcategorias = agrupado[categoria];
      for (const subcategoria in subcategorias) {
        const subDiv = document.createElement('div');
        subDiv.className = 'subcategoria';
        subDiv.textContent = subcategoria;
        container.appendChild(subDiv);

        const tabla = document.createElement('table');
        tabla.className = 'tabla-precios';

        // Encabezados dinámicos según las columnas
        const headers = Object.keys(subcategorias[subcategoria][0]).filter(key =>
          !['Categoría', 'Subcategoría'].includes(key)
        );

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(h => {
          const th = document.createElement('th');
          th.textContent = h;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        tabla.appendChild(thead);

        // Filas de datos
        const tbody = document.createElement('tbody');
        subcategorias[subcategoria].forEach(item => {
          const row = document.createElement('tr');
          headers.forEach(h => {
            const td = document.createElement('td');
            td.textContent = item[h] || '';
            row.appendChild(td);
          });
          tbody.appendChild(row);
        });

        tabla.appendChild(tbody);
        container.appendChild(tabla);
      }
    }
  })
  .catch(err => {
    console.error("Error al cargar los datos:", err);
    const container = document.getElementById('precios-container');
    container.innerHTML = "<p style='color:red;'>No se pudieron cargar los datos. Verificá la conexión o el formato de la hoja.</p>";
  });
