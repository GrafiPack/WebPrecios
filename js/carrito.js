// carrito.js

// Inicializamos window.carrito leyendo de localStorage en cuanto se carga el script
(function () {
  const saved = localStorage.getItem('carritoStickers');
  if (saved) {
    try {
      window.carrito = JSON.parse(saved);
    } catch {
      window.carrito = [];
    }
  } else {
    window.carrito = [];
  }
})();

// Función para agregar item
window.agregarAlCarrito = function(item) {
  console.log("🛒 Agregando al carrito:", item);
  window.carrito.push(item);
  guardarCarrito();
  renderizarCarrito();
};

// Guarda carrito en localStorage
function guardarCarrito() {
  localStorage.setItem('carritoStickers', JSON.stringify(window.carrito));
}

// Renderiza el carrito en el modal
function renderizarCarrito() {
  const cont = document.getElementById('carritoContainer');
  if (!cont) return;

  if (window.carrito.length === 0) {
    cont.innerHTML = '<p class="text-center text-muted">El carrito está vacío.</p>';
  } else {
    let html = `
      <table class="table table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Medidas (mm)</th>
            <th>Cant.</th>
            <th>Unit.</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
    `;
    let total = 0;

    window.carrito.forEach((item, index) => {
      total += item.precioTotal;
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.producto}</td>
          <td>${item.ancho} × ${item.alto}</td>
          <td>${item.cantidad}</td>
          <td>$${Math.round(item.precioUnitario).toLocaleString('es-AR')}</td>
          <td>$${Math.round(item.precioTotal).toLocaleString('es-AR')}</td>
          <td>
            <button class="btn btn-outline-secondary" onclick="eliminarItem(${index})">🗑</button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
      <h5 class="text-end">Total: $${Math.round(total).toLocaleString('es-AR')}</h5>
      <div class="d-flex justify-content-end mt-3">
        <button id="btnEnviarWhatsApp" class="btn btn-outline-secondary">
          📲 Enviar pedido por WhatsApp
        </button>
      </div>
    `;

    cont.innerHTML = html;

    // Listener botón WhatsApp
    document.getElementById('btnEnviarWhatsApp').addEventListener('click', () => {
      if (window.carrito.length === 0) {
        alert('El carrito está vacío.');
        return;
      }

      let mensaje = '📦 *Resumen de tu pedido* 📦\n\n';
      window.carrito.forEach(item => {
        mensaje += `- ${item.cantidad} x ${item.producto} (${item.ancho}×${item.alto} mm): $${Math.round(item.precioTotal).toLocaleString('es-AR')}\n`;
      });
      mensaje += `\n*Total:* $${Math.round(total).toLocaleString('es-AR')}\n\n¡Gracias por tu compra!`;

      const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
      window.open(urlWhatsApp, '_blank');
    });
  }

  actualizarBadge();
}

// Elimina item
function eliminarItem(index) {
  if (index >= 0 && index < window.carrito.length) {
    window.carrito.splice(index, 1);
    guardarCarrito();
    renderizarCarrito();
  }
}

// Actualiza badge
function actualizarBadge() {
  const badge = document.getElementById('carritoCantidadBadge');
  if (badge) {
    badge.textContent = window.carrito.length;
  }
}

// Cuando el navbar se cargó, renderizamos el carrito
document.addEventListener('navbarLoaded', () => {
  renderizarCarrito();
});
