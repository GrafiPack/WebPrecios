const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRaTGWURVvHB6W-AJWfPdxTAWKXCg4LndurNPRGPa5PdqNZVLmU98gbm-wAhublefWQgACV21XpTmx/pub?gid=0&single=true&output=csv";

fetch(sheetURL)
  .then(res => res.text())
  .then(data => {
    const rows = data.split("\n").map(row => row.split(","));
    const destacados = document.getElementById("destacados");
    const precios = document.getElementById("precios");

    let currentRubro = "";
    let table, tbody;

    rows.forEach((cols, index) => {
      if (index === 0 || cols.length < 4) return;

      const [rubro, cantidad, unaCara, ambasCaras, destacado, detalle] = cols.map(c => c.trim());

      // Mostrar destacados si la columna lo indica
      if (destacado.toLowerCase() === "sí" || destacado.toLowerCase() === "si") {
        const card = document.createElement("div");
        card.className = "card " + (Math.random() > 0.5 ? "pink" : "orange");
        card.innerHTML = `
          <div class="precio">$${unaCara}</div>
          <div><strong>${cantidad} ${rubro}</strong></div>
          <div class="detalle">${detalle || "Ambas caras"}</div>
        `;
        destacados.appendChild(card);
      }

      // Organizar por rubros en tablas
      if (rubro !== currentRubro) {
        currentRubro = rubro;
        const section = document.createElement("section");
        section.className = "rubro";
        section.innerHTML = `<h2>${rubro}</h2>`;
        table = document.createElement("table");
        tbody = document.createElement("tbody");
        table.innerHTML = `
          <thead>
            <tr><th>Cantidad</th><th>Una cara</th><th>Ambas caras</th></tr>
          </thead>
        `;
        table.appendChild(tbody);
        section.appendChild(table);
        precios.appendChild(section);
      }

      const row = document.createElement("tr");
      row.innerHTML = `<td>${cantidad}</td><td>$${unaCara}</td><td>$${ambasCaras}</td>`;
      tbody.appendChild(row);
    });
  });
