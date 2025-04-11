const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQt3fGrTZBgJeBD7_m5szRM2ojBqjL8UVOVlmwn0tt1EZBjkbXYDbdKjOUg3NsD4xOsTPjlR9d3-5uD/pub?output=csv";

fetch(url)
  .then(response => response.text())
  .then(csv => Papa.parse(csv, { header: true }).data)
  .then(data => {
    const container = document.getElementById("precios-container");
    const agrupado = {};

    data.forEach(row => {
      const cat = row["Categoría"]?.trim() || "Sin Categoría";
      const subcat = row["Subcategoría"]?.trim() || "General";
      if (!agrupado[cat]) agrupado[cat] = {};
      if (!agrupado[cat][subcat]) agrupado[cat][subcat] = [];
      agrupado[cat][subcat].push(row);
    });

    for (const categoria in agrupado) {
      const catElem = document.createElement("div");
      catElem.className = "categoria";
      catElem.textContent = categoria;
      container.appendChild(catElem);

      for (const subcat in agrupado[categoria]) {
        const subElem = document.createElement("div");
        subElem.className = "subcategoria";
        subElem.textContent = subcat;
        container.appendChild(subElem);

        const tabla = document.createElement("div");
        tabla.className = "tabla-precios";

        const rows = agrupado[categoria][subcat];
        if (rows.length === 0) continue;

        const columnas = Object.keys(rows[0]).filter(k => k !== "Categoría" && k !== "Subcategoría");

        let html = "<table><thead><tr>";
        columnas.forEach(col => html += `<th>${col}</th>`);
        html += "</tr></thead><tbody>";
        rows.forEach(row => {
          html += "<tr>";
          columnas.forEach(col => html += `<td>${row[col]}</td>`);
          html += "</tr>";
        });
        html += "</tbody></table>";

        tabla.innerHTML = html;
        container.appendChild(tabla);
      }
    }
  });
