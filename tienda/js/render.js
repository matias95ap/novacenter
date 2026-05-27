/* ====================================================
   render.js — Renderizado de productos
   Depende de: config.js, filtros.js
   ==================================================== */

/* ---------- capitalizar título ---------- */
function capitalizarTitulo(str) {
  const minusculas = ["y", "a", "o", "de", "para", "en", "con"];
  const mayusculas = ["hdmi", "vga", "rca", "gb", "rgb", "led", "otg", "ps2", "pc", "sata", "sd", "usb", "ok"];
  return str.toLowerCase().split(" ").map(pal => {
    if (mayusculas.includes(pal)) return pal.toUpperCase();
    if (minusculas.includes(pal)) return pal;
    return pal.charAt(0).toUpperCase() + pal.slice(1);
  }).join(" ");
}

/* ---------- crear tarjeta de producto ---------- */
function crearCard(p) {
  const esNuevo      = p.MARCA === "NUEVO";
  const esLiquidacion = esProductoLiquidacion(p);
  const card = document.createElement("div");
  card.className    = "producto";
  card.dataset.codigo = p.CODIGO;
  if (parseInt(p.STOCK) === 0) card.classList.add("sin-stock");

  const precioVenta = parseFloat(p.P.VENTA);
  const mensaje = `Hola, quiero consultar por el producto: ${capitalizarTitulo(p.DETALLE)}\n${TIENDA_BASE}?producto=${p.CODIGO}`;
  const linkWp  = `https://wa.me/${WP_NUMBER}?text=` + encodeURIComponent(mensaje);

  // Insignia arriba (Novedades para regalar)
  let insigniaArriba = "";
  if (parseInt(p.STOCK) > 0 && p["STOCK IDEAL"] === "30") {
    insigniaArriba = `<div class="insignias-arriba"><div class="insignia-texto especial">🎁 Novedades</div></div>`;
  }

  // Insignias abajo
  let insigniaAbajo = "";
  if (parseInt(p.STOCK) > 0 && esNuevo) {
    insigniaAbajo = `<div class="insignias-abajo"><div class="insignia-texto nuevo">🆕 Nuevo</div></div>`;
  }

  // Precio y liquidación
  let precioHTML = `<span class="precio">$${precioVenta.toLocaleString("es-AR")}</span>`;
  let extraHTML  = "";

  if (esLiquidacion && parseInt(p.STOCK) > 0) {
    const precioLista2 = parseFloat(p.P.LISTA2);
    const descuento    = Math.round(((precioLista2 - precioVenta) / precioLista2) * 100);
    precioHTML = `<span class="precio"><s>$${precioLista2.toLocaleString("es-AR")}</s></span>`;
    extraHTML  = `
      <div class="liquidacion-precio">
        <span class="descuento">💸 ${descuento}% OFF</span>
        <span class="precio-final">$${precioVenta.toLocaleString("es-AR")}</span>
      </div>`;
  }

  card.innerHTML = `
    <a href="#" class="link-producto" onclick="event.preventDefault(); navegarProducto('${p.CODIGO}')">
      ${insigniaArriba}
      <img src="img/${p.CODIGO}.webp"
        alt="${capitalizarTitulo(p.DETALLE)}"
        data-codigo="${p.CODIGO}"
        data-intento="0"
        onerror="cargarImagenAlternativa(this)">
      ${insigniaAbajo}
      <h4 class="titulo-producto">${capitalizarTitulo(p.DETALLE)}</h4>
    </a>
    <p class="stock">
      <span class="stock-left">${parseInt(p.STOCK) > 0 ? "✅ En stock" : "❌ Agotado"}</span>
      ${precioHTML}
    </p>
    ${extraHTML}
    <a class="boton-comprar" href="${linkWp}" target="_blank">
      Consultar <i class="fab fa-whatsapp"></i>
    </a>
  `;

  return card;
}

/* ---------- mostrar detalle de producto ---------- */
function mostrarProducto(codigo, categorias) {
  const producto = Object.values(categorias)
    .flatMap(subs => Object.values(subs).flat())
    .find(p => p.CODIGO === codigo);
  if (!producto) return;

  const contenedor    = document.getElementById("contenedor-productos");
  const esLiquidacion = esProductoLiquidacion(producto) && parseInt(producto.STOCK) > 0;
  const esNuevo       = producto.MARCA === "NUEVO" && parseInt(producto.STOCK) > 0;
  const esDiaDelNino  = producto["STOCK IDEAL"] === "30" && parseInt(producto.STOCK) > 0;

  const precioVenta  = parseFloat(producto.P.VENTA);
  const precioLista2 = parseFloat(producto.P.LISTA2);
  const descuento    = esLiquidacion
    ? Math.round(((precioLista2 - precioVenta) / precioLista2) * 100) : 0;

  const mensaje2 = `Hola, quiero consultar por el producto: ${capitalizarTitulo(producto.DETALLE)}\n${TIENDA_BASE}?producto=${producto.CODIGO}`;
  const linkWp2  = `https://wa.me/${WP_NUMBER}?text=` + encodeURIComponent(mensaje2);

  let precioHTML = `<p class="precio">Precio: $${precioVenta.toLocaleString("es-AR")}</p>`;
  let extraHTML  = "";

  if (esLiquidacion) {
    precioHTML = `<span> Antes:</span><span class="precio"><s>$${precioLista2.toLocaleString("es-AR")}</s></span>`;
    extraHTML  = `
      <div class="liquidacion-precio-detalle">
        <span class="precio-final">Ahora: $${precioVenta.toLocaleString("es-AR")}</span>
        <span class="descuento">--->💸 ${descuento}% OFF</span>
      </div>`;
  }

  contenedor.innerHTML = "";
  const div = document.createElement("div");
  div.className = "producto-detalle";
  if (parseInt(producto.STOCK) === 0) div.classList.add("sin-stock");

  div.innerHTML = `
    <h2>${capitalizarTitulo(producto.DETALLE)}</h2>
    <img src="img/${producto.CODIGO}.webp"
      alt="${capitalizarTitulo(producto.DETALLE)}"
      data-codigo="${producto.CODIGO}"
      data-intento="0"
      onerror="cargarImagenAlternativa(this)">
    <div class="precio-detalle">
      ${precioHTML}
      ${extraHTML}
    </div>
    <div class="stock-e-insignias">
      <span class="stock-texto">${parseInt(producto.STOCK) > 0 ? "✅ En stock" : "❌ Agotado"}</span>
      ${esDiaDelNino  ? `<div class="insignia-detalle especial">🎁 Día del Niño</div>`  : ""}
      ${esLiquidacion ? `<div class="insignia-detalle liquidacion">💸 Liquidación</div>` : ""}
      ${esNuevo       ? `<div class="insignia-detalle nuevo">🆕 Nuevo</div>`             : ""}
    </div>
    <a class="boton-comprar2" href="${linkWp2}" target="_blank">
      Toca aquí para Consultar <i class="fab fa-whatsapp"></i>
    </a>
    <div class="boton-accion">
      <button class="boton-atras" onclick="volverProducto()">
        <i class="fa-solid fa-caret-left"></i>Volver
      </button>
      <button class="boton-compartir" onclick="compartirProducto('${producto.DETALLE}','${producto.CODIGO}')">
        Compartir<i class="fa-solid fa-share-nodes"></i>
      </button>
    </div>
  `;

  contenedor.appendChild(div);
}

/* ---------- renderizar todos ---------- */
function renderizarTodos(categorias) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "";

  for (const cat in categorias) {
    const h2 = document.createElement("h2");
    h2.textContent = capitalizarTitulo(cat);
    contenedor.appendChild(h2);

    for (const sub in categorias[cat]) {
      let lista = obtenerProductosFiltradosYOrdenados(categorias[cat][sub]);

      const h3 = document.createElement("h3");
      h3.textContent = capitalizarTitulo(sub);
      contenedor.appendChild(h3);

      const grid = document.createElement("div");
      grid.className = "productos-grid";
      lista.forEach(p => grid.appendChild(crearCard(p)));
      contenedor.appendChild(grid);
    }
  }
}

/* ---------- mostrar categoría ---------- */
function mostrarCategoria(cat, categorias) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = `<h2>${capitalizarTitulo(cat)}</h2>`;

  for (const sub in categorias[cat]) {
    let lista = obtenerProductosFiltradosYOrdenados(categorias[cat][sub]);
    const h3 = document.createElement("h3");
    h3.textContent = capitalizarTitulo(sub);
    contenedor.appendChild(h3);
    const grid = document.createElement("div");
    grid.className = "productos-grid";
    lista.forEach(p => grid.appendChild(crearCard(p)));
    contenedor.appendChild(grid);
  }
}

/* ---------- mostrar subcategoría ---------- */
function mostrarSubcategoria(cat, sub, categorias) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = `<h2>${capitalizarTitulo(cat)} > ${capitalizarTitulo(sub)}</h2>`;
  const lista = obtenerProductosFiltradosYOrdenados(categorias[cat][sub]);
  const grid  = document.createElement("div");
  grid.className = "productos-grid";
  lista.forEach(p => grid.appendChild(crearCard(p)));
  contenedor.appendChild(grid);
}

/* ---------- mostrar nuevos ingresos ---------- */
function mostrarNuevos(data) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "<h2>🆕 Nuevos Ingresos</h2>";
  const lista = obtenerProductosFiltradosYOrdenados(
    data.filter(p => p.MARCA === "NUEVO" && parseInt(p.STOCK) > 0)
  );
  const grid = document.createElement("div");
  grid.className = "productos-grid";
  lista.forEach(p => grid.appendChild(crearCard(p)));
  contenedor.appendChild(grid);
}

/* ---------- mostrar liquidación ---------- */
function mostrarLiquidacion(data) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "<h2>💸 Liquidación</h2>";
  const lista = obtenerProductosFiltradosYOrdenados(
    data.filter(p => parseInt(p.STOCK) > 0 && esProductoLiquidacion(p))
  );
  const grid = document.createElement("div");
  grid.className = "productos-grid";
  lista.forEach(p => grid.appendChild(crearCard(p)));
  contenedor.appendChild(grid);
}

/* ---------- mostrar novedades para regalar ---------- */
function mostrarDiaDelNino(data) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "<h2>🎁 Novedades para Regalar</h2>";
  const lista = obtenerProductosFiltradosYOrdenados(
    data.filter(p => p["STOCK IDEAL"] === "30" && parseInt(p.STOCK) > 0)
  );
  const grid = document.createElement("div");
  grid.className = "productos-grid";
  lista.forEach(p => grid.appendChild(crearCard(p)));
  contenedor.appendChild(grid);
}

/* ---------- buscar productos ---------- */
function buscarProductos(termino, categorias) {
  const t = termino.toLowerCase().trim();
  const resultados = Object.values(categorias)
    .flatMap(subs => Object.values(subs).flat())
    .filter(p => p.DETALLE.toLowerCase().includes(t) || p.CODIGO.toLowerCase().includes(t));

  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "";

  if (!resultados.length) {
    const p = document.createElement("p");
    p.textContent = "No se encontraron resultados.";
    contenedor.appendChild(p);
    return;
  }

  // Agrupar resultados por cat > sub
  const agrupados = {};
  resultados.forEach(p => {
    const [cat, sub = "VARIOS"] = p.FAMILIA.split(" > ");
    if (!agrupados[cat]) agrupados[cat] = {};
    if (!agrupados[cat][sub]) agrupados[cat][sub] = [];
    agrupados[cat][sub].push(p);
  });

  for (const cat in agrupados) {
    const h2 = document.createElement("h2");
    h2.textContent = capitalizarTitulo(cat);
    contenedor.appendChild(h2);
    for (const sub in agrupados[cat]) {
      const lista = obtenerProductosFiltradosYOrdenados(agrupados[cat][sub]);
      const h3 = document.createElement("h3");
      h3.textContent = capitalizarTitulo(sub);
      contenedor.appendChild(h3);
      const grid = document.createElement("div");
      grid.className = "productos-grid";
      lista.forEach(p => grid.appendChild(crearCard(p)));
      contenedor.appendChild(grid);
    }
  }
}

/* ---------- compartir ---------- */
window.compartirProducto = function (detalle, codigo) {
  const url    = `${TIENDA_BASE}?producto=${codigo}`;
  const titulo = capitalizarTitulo(detalle);
  if (navigator.share) {
    navigator.share({ title: titulo, text: `Producto NovaCenter: ${titulo}`, url })
      .catch(err => console.error("Error al compartir:", err));
  } else {
    navigator.clipboard.writeText(url)
      .then(() => alert(`URL copiada: ${url}`))
      .catch(err => console.error("Error al copiar:", err));
  }
};

/* ---------- fallback de imágenes ---------- */
function cargarImagenAlternativa(img) {
  const cod = img.dataset.codigo;
  let intento = parseInt(img.dataset.intento || "0");
  const extensiones = ["webp", "jpg", "png", "placeholder.webp"];
  intento++;
  if (intento >= extensiones.length) return;
  img.dataset.intento = intento;
  img.onerror = () => cargarImagenAlternativa(img);
  const ext = extensiones[intento];
  img.src = ext === "placeholder.webp" ? "img/placeholder.webp" : `img/${cod}.${ext}`;
}
