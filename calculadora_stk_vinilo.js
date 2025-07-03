const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Stickers";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    // Filtramos solo la categoría deseada
    const categoriaDeseada = "Stickers de Vinilo en Plancha Troquelados";
    const dataFiltrada = data.filter(row => {
      const cat = row["Categoría"] || "";
      return cat.trim().startsWith(categoriaDeseada);
    });

    // Llenar combos según subcategorías
    llenarCombo(dataFiltrada, "Diseño", "combo-diseno");
    llenarCombo(dataFiltrada, "Vinilos", "combo-vinilo");
    llenarCombo(dataFiltrada, "Rotulado", "combo-rotulado");
  })
  .catch(error => {
    console.error("Error al cargar datos:", error);
    alert("No se pudo cargar la lista de precios.");
  });

/**
 * Llena un combo filtrando por subcategoría
 * @param {*} datos 
 * @param {*} subcategoria 
 * @param {*} comboId 
 */
function llenarCombo(datos, subcategoria, comboId) {
  const combo = document.getElementById(comboId);
  if (!combo) return;

  const items = datos
    .filter(row => (row["Subcategoría"] || "").trim() === subcategoria)
    .map(row => ({
      detalle: row["Detalle"] || "Sin nombre",
      precio: row["Precio1"] || ""
    }));

  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item.precio;
    option.textContent = `${item.detalle} - $${item.precio}`;
    combo.appendChild(option);
  });
}
