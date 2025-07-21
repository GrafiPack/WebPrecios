const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Calculadoras_Vinilo";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

let PRECIOS_GENERALES = null;

/**
 * Carga precios desde la hoja de Google Sheets
 */
async function cargarPreciosGenerales() {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Error cargando datos: " + resp.statusText);
    const data = await resp.json();

    const preciosGenerales = {};
    data.forEach(item => {
      const categoria = item.CATEGORIA.trim();
      const factoresCantidad = [];
      for (let i = 1; i <= 5; i++) {
        let minRaw = item[`Minimo${i}`];
        let factorRaw = item[`Factor${i}`];
        if (minRaw == null || factorRaw == null) continue; // ✅ seguir, no cortar
        const min = Number(String(minRaw).replace(",", "."));
        const factor = Number(String(factorRaw).replace(",", "."));
        if (!isNaN(min) && !isNaN(factor)) {
          factoresCantidad.push({ min, factor });
        }
      }
      factoresCantidad.sort((a, b) => a.min - b.min);

      preciosGenerales[categoria] = {
        precioPorM2: Number(String(item.PrecioPorM2).replace(",", ".")) || 0,
        precioFijo: Number(String(item.precioFijo).replace(",", ".")) || 0,
        precioFijoUnidad: Number(String(item.precioFijoUnidad).replace(",", ".")) || 0,
        factoresCantidad,
        altoMaximo: Number(String(item.AltoMaximo).replace(",", ".")) || 980,
        anchoMaximo: Number(String(item.AnchoMaximo).replace(",", ".")) || 580,
        altoMinimo: Number(String(item.AltoMinimo).replace(",", ".")) || 50,
        anchoMinimo: Number(String(item.AnchoMinimo).replace(",", ".")) || 50
      };
    });

    console.log("✅ PRECIOS_GENERALES cargado:", preciosGenerales);
    return preciosGenerales;

  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Genera radios dinámicos según factoresCantidad
 */
function generarRadiosCantidad(factoresCantidad) {
  const contenedorRadios = document.getElementById('contenedorRadiosCantidad');
  contenedorRadios.innerHTML = '';

  factoresCantidad.forEach((f, i) => {
    const id = `cantidad${f.min}`;
    const input = document.createElement('input');
    input.type = 'radio';
    input.className = 'btn-check';
    input.name = 'cantidad';
    input.id = id;
    input.value = f.min;
    if (i === 0) input.checked = true;

    const label = document.createElement('label');
    label.className = 'btn btn-outline-secondary';
    label.htmlFor = id;
    label.textContent = f.min;

    contenedorRadios.appendChild(input);
    contenedorRadios.appendChild(label);
  });
}
