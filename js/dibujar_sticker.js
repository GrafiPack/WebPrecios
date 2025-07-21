function dibujarPreview(filas, columnas, stickerW, stickerH, planchaAncho, planchaAlto) {
  const canvas = document.getElementById('previewCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const escalaX = canvas.width / planchaAncho;
  const escalaY = canvas.height / planchaAlto;

  ctx.fillStyle = '#f8f8f8'; // fondo plancha
  ctx.fillRect(0, 0, planchaAncho * escalaX, planchaAlto * escalaY);

  ctx.fillStyle = '#4CAF50'; // stickers

  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas; col++) {
      const x = col * stickerW * escalaX;
      const y = fila * stickerH * escalaY;
      ctx.fillRect(x, y, stickerW * escalaX, stickerH * escalaY);
    }
  }
}
