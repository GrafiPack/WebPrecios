// tamano_impresion.js
// ---------------------------
// Calculadora tamaño impresión - JS limpio y documentado
// ---------------------------

document.addEventListener('DOMContentLoaded', () => {

  // ---------------------------
  // SELECTORES PRINCIPALES
  // ---------------------------
  const fileInput = document.getElementById('fileInput');
  const btnCargarImagen = document.getElementById('btnCargarImagen');
  const imgPreview = document.getElementById('imgPreview');
  const overlay = document.getElementById('overlayRecorte');
  const resultado = document.getElementById('resultado');
  const botonesResolucion = document.querySelectorAll('.btn-resolucion:not(#btnCopiar)');
  const spinner = document.getElementById('spinnerCarga');
  const btnText = document.getElementById('btnText');

  const mostrarOverlayCheck = document.getElementById('mostrarOverlayCheck');
  const medidasOverlayInline = document.getElementById('medidasOverlayInline');

  const btnCopiar = document.getElementById('btnCopiar');

  const redimensionarCheck = document.getElementById('redimensionarCheck');
  const redimensionarInputs = document.getElementById('redimensionarInputs');
  const inputAncho = document.getElementById('inputAncho');
  const inputAlto = document.getElementById('inputAlto');
  const dpiResultLabel = document.getElementById('dpiResultLabel');

  const toggleOpcionesBtn = document.getElementById('toggleResolucionBtn') || document.getElementById('toggleOpcionesBtn');

  // ---------------------------
  // ESTADO
  // ---------------------------
  let img = new Image();
  let imgWidth = 0, imgHeight = 0;
  let imagenCargada = false;
  let currentFileName = '';
  let cropWidth = 100, cropHeight = 100;
  let offsetX = 0, offsetY = 0;
  let dragging = false, resizing = false, currentHandle = null, startX = 0, startY = 0;
  let escalaFactor = 1;

  if (inputAncho) inputAncho.disabled = true;
  if (inputAlto) inputAlto.disabled = true;

  // ---------------------------
  // UTILIDADES
  // ---------------------------
  function leerArchivo(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(e);
      reader.readAsDataURL(file);
    });
  }

  function show(el, value = 'block') { if (el) el.style.display = value; }
  function hide(el) { if (el) el.style.display = 'none'; }

  function actualizarOverlay() {
    if (!overlay) return;
    overlay.style.left = offsetX + 'px';
    overlay.style.top = offsetY + 'px';
    overlay.style.width = cropWidth + 'px';
    overlay.style.height = cropHeight + 'px';
    actualizarMedidasCrop();
  }

  function actualizarMedidasCrop() {
    if (!imagenCargada) return;
    const dpiBtn = document.querySelector('.btn-resolucion.active');
    const dpi = dpiBtn ? parseInt(dpiBtn.dataset.dpi) : 300;
    const factor = 2.54 / dpi * escalaFactor;

    const dispRect = imgPreview.getBoundingClientRect();
    const displayW = imgPreview.clientWidth || dispRect.width || imgWidth || 1;
    const displayH = imgPreview.clientHeight || dispRect.height || imgHeight || 1;

    const anchoCm = (cropWidth / displayW * imgWidth * factor);
    const altoCm  = (cropHeight / displayH * imgHeight * factor);
    const posXCm  = (offsetX / displayW * imgWidth * factor);
    const posYCm  = (offsetY / displayH * imgHeight * factor);

    if (medidasOverlayInline) {
      medidasOverlayInline.textContent = `Derecha: ${posXCm.toFixed(1)} cm, Arriba: ${posYCm.toFixed(1)} cm, Largo: ${anchoCm.toFixed(1)} cm, Alto: ${altoCm.toFixed(1)} cm`;
    }
  }

  function calcularResultado() {
    if (!imagenCargada) return;
    const dpiBtn = document.querySelector('.btn-resolucion.active');
    const dpi = dpiBtn ? parseInt(dpiBtn.dataset.dpi) : 300;

    const anchoMax = ((imgWidth / dpi) * 2.54).toFixed(1);
    const altoMax  = ((imgHeight / dpi) * 2.54).toFixed(1);

    resultado.innerHTML = `<p class="resultado-destacado">Tamaño máximo recomendado de impresión: ${anchoMax} cm × ${altoMax} cm</p>`;

    actualizarMedidasCrop();
  }

  // ---------------------------
  // CARGA DE IMAGEN
  // ---------------------------
  btnCargarImagen.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    currentFileName = file.name || '';

    // reset visuales
    if (mostrarOverlayCheck) mostrarOverlayCheck.checked = false;
    hide(overlay);
    if (medidasOverlayInline) medidasOverlayInline.style.display = 'none';
    hide(btnCopiar);
    show(spinner, 'inline-block');
    btnText.textContent = 'Cargando...';
    hide(imgPreview);
    const noFile = document.getElementById('noFile');
    if (noFile) hide(noFile);

    try {
      const dataURL = await leerArchivo(file);
      imgPreview.src = dataURL;
      img.src = dataURL;

      imgPreview.onload = () => {
        imgWidth = imgPreview.naturalWidth || imgWidth;
        imgHeight = imgPreview.naturalHeight || imgHeight;
        imagenCargada = true;

        show(imgPreview, 'block');
        hide(spinner);
        btnText.textContent = 'Cargar imagen';

        // mostrar controles
        const controles = document.getElementById('controles');
        if (controles) controles.style.display = 'block';

        escalaFactor = 1;
        if (inputAncho) inputAncho.disabled = !redimensionarCheck || !redimensionarCheck.checked;
        if (inputAlto) inputAlto.disabled = !redimensionarCheck || !redimensionarCheck.checked;

        // botón DPI por defecto
        if (botonesResolucion && botonesResolucion.length) {
          botonesResolucion.forEach(b => b.classList.remove('active'));
          botonesResolucion[0].classList.add('active');
        }

        // overlay centrado
        cropWidth = Math.max(40, imgPreview.clientWidth / 2);
        cropHeight = Math.max(40, imgPreview.clientHeight / 2);
        offsetX = Math.round((imgPreview.clientWidth - cropWidth) / 2);
        offsetY = Math.round((imgPreview.clientHeight - cropHeight) / 2);

        actualizarOverlay();
        calcularResultado();
        show(btnCopiar, 'inline-block');
      };
    } catch (err) {
      console.error('Error leyendo la imagen:', err);
      hide(spinner);
      btnText.textContent = 'Cargar imagen';
      if (noFile) show(noFile, 'block');
    }
  });

  // ---------------------------
  // BOTONES DPI
  // ---------------------------
  botonesResolucion.forEach(btn => {
    btn.addEventListener('click', () => {
      botonesResolucion.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      calcularResultado();
      if (typeof updateDpiResult === 'function') updateDpiResult();
    });
  });

  // ---------------------------
  // OVERLAY
  // ---------------------------
  if (mostrarOverlayCheck) {
    mostrarOverlayCheck.addEventListener('change', () => {
      overlay.style.display = mostrarOverlayCheck.checked ? 'block' : 'none';
      medidasOverlayInline.style.display = mostrarOverlayCheck.checked ? 'inline' : 'none';
    });
  }

  // ---------------------------
  // DRAG & RESIZE OVERLAY
  // ---------------------------
  if (overlay) {
    overlay.addEventListener('mousedown', e => {
      if (e.target.classList.contains('handle')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      e.preventDefault();
    });
  }

  document.querySelectorAll('.handle').forEach(handle => {
    handle.addEventListener('mousedown', e => {
      resizing = true;
      currentHandle = handle;
      e.preventDefault();
      e.stopPropagation();
    });
  });

  document.addEventListener('mousemove', e => {
    if (!imagenCargada) return;
    const rect = imgPreview.getBoundingClientRect();
    if (dragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      offsetX = Math.min(Math.max(0, offsetX + dx), imgPreview.clientWidth - cropWidth);
      offsetY = Math.min(Math.max(0, offsetY + dy), imgPreview.clientHeight - cropHeight);
      startX = e.clientX;
      startY = e.clientY;
      actualizarOverlay();
    } else if (resizing && currentHandle) {
      let mouseX = e.clientX - rect.left;
      let mouseY = e.clientY - rect.top;
      // lógica simplificada de resize
      if (currentHandle.classList.contains('bottom-right')) {
        cropWidth = Math.min(imgPreview.clientWidth - offsetX, Math.max(20, mouseX - offsetX));
        cropHeight = Math.min(imgPreview.clientHeight - offsetY, Math.max(20, mouseY - offsetY));
      }
      actualizarOverlay();
    }
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    resizing = false;
    currentHandle = null;
  });

  // ---------------------------
  // COPIAR AL PORTAPAPELES
  // ---------------------------
  if (btnCopiar) {
    btnCopiar.addEventListener('click', () => {
      if (!imagenCargada) return;

      const dpiBtn = document.querySelector('.btn-resolucion.active');
      const dpiSelected = dpiBtn ? parseInt(dpiBtn.dataset.dpi) : 300;

      const realImgWidth  = imgWidth;
      const realImgHeight = imgHeight;

      let texto = '';

      if (mostrarOverlayCheck && mostrarOverlayCheck.checked) {
        const displayWidth  = imgPreview.clientWidth || realImgWidth;
        const displayHeight = imgPreview.clientHeight || realImgHeight;

        const posXpx = (offsetX / displayWidth) * realImgWidth;
        const posYpx = (offsetY / displayHeight) * realImgHeight;
        const anchoPx = (cropWidth / displayWidth) * realImgWidth;
        const altoPx  = (cropHeight / displayHeight) * realImgHeight;
        const factor = 2.54 / dpiSelected * escalaFactor;

        let dpiTexto;
        if (redimensionarCheck && redimensionarCheck.checked) {
        // Si está escalado, usamos el DPI final calculado
          dpiTexto = Math.round(realImgWidth / (parseFloat(inputAncho.value) / 2.54));
        } else {
          // Si no, usamos el DPI del botón activo
          dpiTexto = dpiSelected;
        }


        texto = `Derecha: ${(posXpx*factor).toFixed(1)} cm, Izquierda: ${(posYpx*factor).toFixed(1)} cm, Largo: ${(anchoPx*factor).toFixed(1)} cm, Alto: ${(altoPx*factor).toFixed(1)} cm, Resolución: ${dpiTexto} dpi`;


      } else if (redimensionarCheck && redimensionarCheck.checked) {
        const nuevoAnchoCm = parseFloat(inputAncho.value) || 0;
        const nuevoAltoCm  = parseFloat(inputAlto.value) || 0;
        if (!(nuevoAnchoCm>0 && nuevoAltoCm>0)) { alert('Introduce dimensiones válidas'); return; }

        const dpiFinal = realImgWidth / (nuevoAnchoCm / 2.54);
        texto = `Largo: ${nuevoAnchoCm.toFixed(1)} cm, Alto: ${nuevoAltoCm.toFixed(1)} cm, Resolución: ${Math.round(dpiFinal)} dpi`;
      } else {
        const anchoMaxCm = ((realImgWidth / dpiSelected) * 2.54).toFixed(1);
        const altoMaxCm  = ((realImgHeight / dpiSelected) * 2.54).toFixed(1);
        texto = `Ancho máximo: ${anchoMaxCm} cm, Alto máximo: ${altoMaxCm} cm, Resolución: ${dpiSelected} dpi`;
      }

      if (!currentFileName && fileInput.files[0]) currentFileName = fileInput.files[0].name;
      if (currentFileName) texto += `, Archivo: ${currentFileName}`;

      navigator.clipboard.writeText(texto).then(() => {
        alert(`✅ Datos copiados al portapapeles:\n\n${texto}`);
      }).catch(err => {
        console.error('Error copiando al portapapeles', err);
        alert('❌ No se pudo copiar al portapapeles');
      });

    });
  }

  // ---------------------------
  // REDIMENSIONAR
  // ---------------------------
  if (redimensionarCheck) {
    redimensionarCheck.addEventListener('change', () => {
      const mostrarInputs = redimensionarCheck.checked;
      if (redimensionarInputs) redimensionarInputs.style.display = mostrarInputs ? 'flex' : 'none';
      if (inputAncho) inputAncho.disabled = !mostrarInputs;
      if (inputAlto) inputAlto.disabled = !mostrarInputs;

      if (mostrarInputs && imagenCargada) {
        const dpiBtn = document.querySelector('.btn-resolucion.active');
        const dpi = dpiBtn ? parseInt(dpiBtn.dataset.dpi) : 300;
        if (inputAncho) inputAncho.value = (imgWidth*2.54/dpi).toFixed(1);
        if (inputAlto) inputAlto.value = (imgHeight*2.54/dpi).toFixed(1);
        escalaFactor = 1;
        actualizarMedidasCrop();
      } else {
        escalaFactor = 1;
        if (dpiResultLabel) dpiResultLabel.innerHTML = '';
        actualizarMedidasCrop();
      }
      if (typeof updateDpiResult === 'function') updateDpiResult();
    });

    if (inputAncho) inputAncho.addEventListener('input', () => {
      if (inputAncho.disabled) return;
      actualizarEscala('ancho');
      if (typeof updateDpiResult === 'function') updateDpiResult();
      calcularResultado();
    });
    if (inputAlto) inputAlto.addEventListener('input', () => {
      if (inputAlto.disabled) return;
      actualizarEscala('alto');
      if (typeof updateDpiResult === 'function') updateDpiResult();
      calcularResultado();
    });
  }

  function actualizarEscala(changed) {
    if (!imagenCargada) return;
    const dpiBtn = document.querySelector('.btn-resolucion.active');
    const dpi = dpiBtn ? parseInt(dpiBtn.dataset.dpi) : 300;
    const anchoOriginal = imgWidth*2.54/dpi;
    const altoOriginal  = imgHeight*2.54/dpi;

    if (changed==='ancho') {
      const nuevoAncho = parseFloat(inputAncho.value);
      if (isNaN(nuevoAncho)||nuevoAncho<=0) return;
      inputAlto.value = (nuevoAncho/anchoOriginal*altoOriginal).toFixed(1);
      escalaFactor = nuevoAncho/anchoOriginal;
    } else {
      const nuevoAlto = parseFloat(inputAlto.value);
      if (isNaN(nuevoAlto)||nuevoAlto<=0) return;
      inputAncho.value = (nuevoAlto/altoOriginal*anchoOriginal).toFixed(1);
      escalaFactor = nuevoAlto/altoOriginal;
    }
    actualizarMedidasCrop();
  }

  function updateDpiResult() {
    if (!redimensionarCheck||!redimensionarCheck.checked||!imagenCargada) {
      if (dpiResultLabel) dpiResultLabel.innerHTML = '';
      return;
    }
    const nuevoAnchoCm = parseFloat(inputAncho.value);
    const anchoPixels = imgPreview.naturalWidth||imgWidth||0;
    if (!(nuevoAnchoCm>0 && anchoPixels>0)) { dpiResultLabel.innerHTML=''; return; }
    const dpiFinal = anchoPixels/(nuevoAnchoCm/2.54);
    if (dpiResultLabel) dpiResultLabel.innerHTML = `📊 Resolución: <strong>${Math.round(dpiFinal)} dpi</strong>`;
  }

}); // end DOMContentLoaded
