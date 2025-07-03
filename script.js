const sheetID = "1p3Q-DpF8JcdGIWwOns7rirsgoVJ6LES2LzaBgGE42XI";
const sheetName = "Hoja 1";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

// Carga de datos desde la hoja de cálculo
fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("precios-container");
    if (!data || data.length === 0) {
      container.innerHTML = "<p>No se encontraron datos en la hoja de cálculo.</p>";
      return;
    }

    // Filtrar encabezados de la hoja
    const dataFiltrada = data.filter(row => row.Categoría !== "Categoría");

    // Agrupar por categoría y subcategoría
    const grouped = {};
    dataFiltrada.forEach(row => {
      const categoriaRaw = row['Categoría'] || "Sin categoría";
      const [categoria, observacion] = categoriaRaw.split(";").map(x => x.trim());
      const subcategoria = row['Subcategoría'] || "Sin subcategoría";
      const key = `${categoria}${observacion ? `;${observacion}` : ""}`;

      if (!grouped[key]) grouped[key] = {};
      if (!grouped[key][subcategoria]) grouped[key][subcategoria] = [];
      grouped[key][subcategoria].push(row);
    });

    // Renderizar tablas
    for (const key in grouped) {
      const [categoria, observacion] = key.split(";");

      // Título de categoría
      const catEl = document.createElement("div");
      catEl.className = "category-title";
      catEl.innerHTML = `<span>${categoria}</span>` + 
        (observacion ? `<span class="category-obs">${observacion}</span>` : "");
      container.appendChild(catEl);

      // Subcategorías
      for (const subcategoria in grouped[key]) {
        const productos = grouped[key][subcategoria];
        const encabezados = productos[0]["Encabezados"];
        const encabezadosArray = encabezados ? encabezados.split(",").map(h => h.trim()) : [];

        // Columnas activas de precios
        const columnasPrecio = Object.keys(productos[0])
          .filter(k => k.startsWith("Precio"))
          .filter(k => productos.some(p => p[k] && p[k].trim() !== ""));

        const wrapper = document.createElement("div");
        wrapper.className = "table-container";

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        // Encabezado de subcategoría
        const thSubcat = document.createElement("th");
        thSubcat.textContent = subcategoria;
        headerRow.appendChild(thSubcat);

        // Encabezados personalizados
        columnasPrecio.forEach((col, index) => {
          const th = document.createElement("th");
          const encabezado = encabezadosArray[index] || "Nota";
          th.textContent = encabezado;
          if (encabezado === "Nota") th.classList.add("align-left");
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Cuerpo de tabla
        const tbody = document.createElement("tbody");
        productos.forEach(prod => {
          // FILTRO según columna Mostrar
          const mostrar = prod["Mostrar"];
          if (!mostrar || mostrar.toString().toLowerCase() === "true") {
            return; // No mostrar esta fila
          }

          const tr = document.createElement("tr");

          // Detalle
          const tdDetalle = document.createElement("td");
          tdDetalle.textContent = prod.Detalle || "";
          tr.appendChild(tdDetalle);

          // Precios
          columnasPrecio.forEach((col, i) => {
            const td = document.createElement("td");
            td.textContent = prod[col] || "";
            if ((encabezadosArray[i] || "Nota") === "Nota") {
              td.classList.add("align-left");
            }
            // Doble clic para agregar
            td.addEventListener('dblclick', () => agregarAFavoritos(tr, td));
            tr.appendChild(td);
          });

          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        wrapper.appendChild(table);
        container.appendChild(wrapper);
      }
    }
  })
  .catch((error) => {
    console.error("Error al cargar los datos:", error);
    document.getElementById("precios-container").innerHTML = `
      <p style="color:red;">No se pudieron cargar los datos. Verificá el enlace de la hoja de cálculo.</p>
    `;
  });

// ========================
// Agregar producto a lista
// ========================
function agregarAFavoritos(fila, celdaClickeada) {
  const tabla = document.querySelector("#lista-seleccionada tbody");
  const celdasFila = fila.querySelectorAll("td");
  const tr = document.createElement("tr");

  // Producto
  const tdProducto = document.createElement("td");
  tdProducto.textContent = celdasFila[0].textContent; // Nombre del producto (primera columna)
  tr.appendChild(tdProducto);

  // Cantidad
  const tdCantidad = document.createElement("td");
  const input = document.createElement("input");
  input.type = "number";
  input.min = "1";
  input.value = "1";
  input.className = "cantidad-input";
  input.addEventListener("input", actualizarSubtotal);
  setTimeout(() => input.dispatchEvent(new Event("input")), 0);
  tdCantidad.appendChild(input);
  tr.appendChild(tdCantidad);

  // Precio
  const tdPrecio = document.createElement("td");
  tdPrecio.textContent = celdaClickeada.textContent;
  tr.appendChild(tdPrecio);

  // Subtotal
  const tdSubtotal = document.createElement("td");
  tdSubtotal.textContent = `$ ${parseFloat(celdaClickeada.textContent.replace(/[^0-9.-]+/g, '')).toFixed(2)}`;
  tr.appendChild(tdSubtotal);

  // Eliminar
  const tdEliminar = document.createElement("td");
  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "🗑️";
  btnEliminar.onclick = () => {
    tr.remove();
    actualizarTotal();
  };
  tdEliminar.appendChild(btnEliminar);
  tr.appendChild(tdEliminar);

  // Verificar si ya existe producto+precio igual, sumar cantidad
  const filaExistente = Array.from(tabla.children).find(row =>
    row.children[0].textContent === tdProducto.textContent &&
    row.children[2].textContent === tdPrecio.textContent
  );

  if (filaExistente) {
    const inputCantidad = filaExistente.querySelector("input");
    inputCantidad.value = parseInt(inputCantidad.value) + 1;
    inputCantidad.dispatchEvent(new Event('input'));
    return;
  }

  tabla.appendChild(tr);
  actualizarTotal();
}

// ========================
// Actualizar subtotal
// ========================
function actualizarSubtotal() {
  const fila = this.closest('tr');
  const precioTexto = fila.children[2].textContent.replace(/\./g, '').replace(/[^0-9,-]+/g, '');
  const precio = parseFloat(precioTexto.replace(',', '.')) || 0;
  const cantidad = parseFloat(this.value) || 0;
  const subtotal = precio * cantidad;

  fila.children[3].textContent = `$ ${Math.round(subtotal)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

  actualizarTotal();
}

// ========================
// Calcular total
// ========================
function actualizarTotal() {
  let total = 0;
  document.querySelectorAll("#lista-seleccionada tbody tr").forEach(fila => {
    let textoSubtotal = fila.children[3].textContent;

    textoSubtotal = textoSubtotal
      .replace(/\$/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const subtotal = parseFloat(textoSubtotal) || 0;
    total += subtotal;
  });

  const totalDisplay = document.getElementById("total-general");
  if (totalDisplay) {
    totalDisplay.textContent = Math.round(total)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}

// ========================
// Vaciar lista
// ========================
function vaciarLista() {
  document.querySelector("#lista-seleccionada tbody").innerHTML = "";
  actualizarTotal();
}
