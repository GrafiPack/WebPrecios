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
      throw new Error("No hay datos");
    }

    data.forEach(row => {
      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <div class="product-name"><strong>${row.Rubro}</strong></div>
        <div class="details">Cantidad: ${row.Cantidad}</div>
        <div class="details">Una cara: ${row["Una cara"]}</div>
        <div class="details">Ambas caras: ${row["Ambas caras"]}</div>
      `;

      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error("Error al cargar los datos:", err);
    document.getElementById('error-message').style.display = 'block';
  });
