const sheetID = "2PACX-1vTRaTGWURVvHB6W-AJWfPdxTAWKXCg4LndurNPRGPa5PdqNZVLmU98gbm-wAhublefWQgACV21XpTmx";
const sheetName = "Hoja1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

fetch(url)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    const container = document.getElementById('precios-container');
    if (!Array.isArray(data) || data.length === 0 || !data[0].Producto || !data[0].Precio) {
      throw new Error("Formato inesperado de datos");
    }
    data.forEach(row => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="product-name">${row.Producto}</div>
        <div class="price">$${row.Precio}</div>
      `;
      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error("Error al cargar los datos:", err);
    document.getElementById('error-message').style.display = 'block';
  });
