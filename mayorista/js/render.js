/* ====================================================
   render.js — Renderizado de productos (mayorista)
   Depende de: config.js, filtros.js
   Usa: shared/capitalizar.js, shared/imagenes.js
   ==================================================== */

/* ---------- marcar botón activo en sidebar ---------- */
function marcarFiltroActivo(clave) {
  document.querySelectorAll(".btn-filtro-especial").forEach(btn => {
    btn.classList.toggle("activo", btn.dataset.clave === clave);
  });
}

/* ---------- crear tarjeta de producto ---------- */
function crearCard(p) {
  const card = document.createElement("div");
  card.className      = "producto";
  card.dataset.codigo = p.CODIGO;
  if (parseInt(p.STOCK) === 0) card.classList.add("sin-stock");

  const precioMayorista = parseFloat(p.P.LISTA3 || 0);
  const mensaje = `Hola, quiero consultar por el producto: ${capitalizarTitulo(p.DETALLE)}\n${TIENDA_BASE}?producto=${p.CODIGO}`;
  const linkWp  = `https://wa.me/${WP_NUMBER}?text=` + encodeURIComponent(mensaje);

  let insigniaAbajo = "";
  if (parseInt(p.STOCK) > 0 && p.MARCA === "NUEVO") {
    insigniaAbajo = `<div class="insignias-abajo"><div class="insignia-texto nuevo">🆕 Nuevo</div></div>`;
  }

  card.innerHTML = `
    <a href="#" class="link-producto" onclick="event.preventDefault(); navegarProducto('${p.CODIGO}')">
      <img src="${IMG_BASE}${p.CODIGO}.webp"
        alt="${capitalizarTitulo(p.DETALLE)}"
        data-codigo="${p.CODIGO}"
        data-intento="0"
        onerror="cargarImagenAlternativa(this)">
      ${insigniaAbajo}
      <h4 class="titulo-producto">${capitalizarTitulo(p.DETALLE)}</h4>
    </a>
    <p class="stock">
      <span class="stock-left">${parseInt(p.STOCK) > 0 ? "✅ En stock" : "❌ Agotado"}</span>
      <span class="precio">$${precioMayorista.toLocaleString("es-AR")} <span class="precio-mayorista-label">MAY</span></span>
    </p>
    <a class="boton-comprar" href="${linkWp}" target="_blank">
      Consultar <i class="fab fa-whatsapp"></i>
    </a>
  `;

  return card;
}

/* ---------- mostrar detalle de un producto ---------- */
function mostrarProducto(codigo, categorias) {
  const producto = Object.values(categorias)
    .flatMap(subs => Object.values(subs).flat())
    .find(p => p.CODIGO === codigo);
  if (!producto) return;

  const contenedor      = document.getElementById("contenedor-productos");
  const precioMayorista = parseFloat(producto.P.LISTA3 || 0);
  const mensaje2 = `Hola, quiero consultar por el producto: ${capitalizarTitulo(producto.DETALLE)}\n${TIENDA_BASE}?producto=${producto.CODIGO}`;
  const linkWp2  = `https://wa.me/${WP_NUMBER}?text=` + encodeURIComponent(mensaje2);

  contenedor.innerHTML = "";
  const div = document.createElement("div");
  div.className = "producto-detalle";
  if (parseInt(producto.STOCK) === 0) div.classList.add("sin-stock");

  div.innerHTML = `
    <h2>${capitalizarTitulo(producto.DETALLE)}</h2>
    <img src="${IMG_BASE}${producto.CODIGO}.webp"
      alt="${capitalizarTitulo(producto.DETALLE)}"
      data-codigo="${producto.CODIGO}"
      data-intento="0"
      onerror="cargarImagenAlternativa(this)">
    <div class="precio-detalle">
      <p class="precio">
        Precio Mayorista: $${precioMayorista.toLocaleString("es-AR")}
        <span class="precio-mayorista-label">MAY</span>
      </p>
    </div>
    <div class="stock-e-insignias">
      <span class="stock-texto">${parseInt(producto.STOCK) > 0 ? "✅ En stock" : "❌ Agotado"}</span>
      ${producto.MARCA === "NUEVO" ? `<div class="insignia-detalle nuevo">🆕 Nuevo</div>` : ""}
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

/* ---------- renderizar todos los productos ---------- */
function renderizarTodos(categorias, busqueda = "") {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "";
  marcarFiltroActivo(null);

  for (const cat in categorias) {
    let hayProductosEnCat = false;
    const fragmentoCat = document.createDocumentFragment();

    const h2 = document.createElement("h2");
    h2.textContent = capitalizarTitulo(cat);
    fragmentoCat.appendChild(h2);

    for (const sub in categorias[cat]) {
      const familia = `${cat} > ${sub}`;
      const prods = categorias[cat][sub].map(p => ({ ...p, FAMILIA: p.FAMILIA || familia }));
      let lista = aplicarFiltroMayorista(prods, busqueda);
      lista = obtenerProductosFiltradosYOrdenados(lista);
      if (!lista.length) continue;

      hayProductosEnCat = true;
      const h3 = document.createElement("h3");
      h3.textContent = capitalizarTitulo(sub);
      fragmentoCat.appendChild(h3);

      const grid = document.createElement("div");
      grid.className = "productos-grid";
      lista.forEach(p => grid.appendChild(crearCard(p)));
      fragmentoCat.appendChild(grid);
    }

    if (hayProductosEnCat) contenedor.appendChild(fragmentoCat);
  }

  if (!contenedor.children.length) {
    const p = document.createElement("p");
    p.textContent = "No se encontraron productos.";
    contenedor.appendChild(p);
  }
}

/* ---------- renderizar filtro especial ---------- */
function renderizarFiltroEspecial(clave, categorias, busqueda = "") {
  filtroActivoKey = clave;
  marcarFiltroActivo(clave);

  const contenedor = document.getElementById("contenedor-productos");
  const config     = filtrosEspeciales[clave];
  contenedor.innerHTML = `<h2>📲 ${config.label}</h2>`;

  let hayAlgo = false;
  for (const cat in categorias) {
    for (const sub in categorias[cat]) {
      const familia = `${cat} > ${sub}`;
      const prods = categorias[cat][sub].map(p => ({ ...p, FAMILIA: p.FAMILIA || familia }));
      let lista = aplicarFiltroMayorista(prods, busqueda);
      lista = obtenerProductosFiltradosYOrdenados(lista);
      if (!lista.length) continue;

      hayAlgo = true;
      const h3 = document.createElement("h3");
      h3.textContent = `${capitalizarTitulo(cat)} > ${capitalizarTitulo(sub)}`;
      contenedor.appendChild(h3);

      const grid = document.createElement("div");
      grid.className = "productos-grid";
      lista.forEach(p => grid.appendChild(crearCard(p)));
      contenedor.appendChild(grid);
    }
  }

  if (!hayAlgo) {
    const p = document.createElement("p");
    p.textContent = "No se encontraron productos para este filtro.";
    contenedor.appendChild(p);
  }
}

/* ---------- mostrar categoría ---------- */
function mostrarCategoria(cat, categorias) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = `<h2>${capitalizarTitulo(cat)}</h2>`;
  marcarFiltroActivo(null);
  for (const sub in categorias[cat]) {
    let lista = aplicarFiltroMayorista(categorias[cat][sub]);
    lista = obtenerProductosFiltradosYOrdenados(lista);
    if (!lista.length) continue;
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
  marcarFiltroActivo(null);
  let lista = aplicarFiltroMayorista(categorias[cat][sub]);
  lista = obtenerProductosFiltradosYOrdenados(lista);
  const grid = document.createElement("div");
  grid.className = "productos-grid";
  lista.forEach(p => grid.appendChild(crearCard(p)));
  contenedor.appendChild(grid);
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
