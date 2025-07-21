// includePartials.js

async function includePartial(url, elementId) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    document.getElementById(elementId).innerHTML = html;

    if (elementId === 'navbar-container') {
      // Ahora que existe el navbar, cargamos carrito.js
      const script = document.createElement('script');
      script.src = 'js/carrito.js';
      script.onload = () => {
        document.dispatchEvent(new Event('navbarLoaded'));
      };
      document.body.appendChild(script);
    }

  } catch (error) {
    console.error(`Error cargando ${url}:`, error);
  }
}

// Y en tu HTML principal solo:
includePartial('navbar.html', 'navbar-container');
includePartial('footer.html', 'footer-container');
