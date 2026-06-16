/* ====================================================
   admin/js/ver-todos.js — Modo "Ver Todos"
   Único modo con lógica propia. Muestra venta, mayor,
   costo (toggle) y stock para cada producto.

   Depende de: shared/config-global.js, shared/excluidos.js,
               shared/capitalizar.js, shared/imagenes.js,
               shared/busqueda.js, shared/arrancar.js,
               tienda/js/sidebar.js (reutilizado, sin exclusiones)
   ==================================================== */

let _categoriasTodos = null;
let _dataTodos       = null;

/* ---------- liquidación (igual que tienda) ---------- */
function esProductoLiquidacion(p) {
  const lista2 = parseFloat(p.P.LISTA2);
  const venta  = parseFloat(p.P.VENTA);
  return lista2 > venta;
}

/* ---------- ordenar ---------- */
function ordenarProductos(lista, criterio) {
  switch (criterio) {
    case "precio-asc":  return lista.sort((a, b) => parseFloat(a.P.VENTA) - parseFloat(b.P.VENTA));
    case "precio-desc": return lista.sort((a, b) => parseFloat(b.P.VENTA) - parseFloat(a.P.VENTA));
    case "nombre-asc":  return lista.sort((a, b) => a.DETALLE.localeCompare(b.DETALLE));
    case "nombre-desc": return lista.sort((a, b) => b.DETALLE.localeCompare(a.DETALLE));
    default:
      const conStock = lista.filter(p => parseInt(p.STOCK) > 0);
      const sinStock = lista.filter(p => parseInt(p.STOCK) === 0);
      return [...conStock, ...sinStock];
  }
}

/* ---------- aplicar stock y orden ---------- */
function obtenerProductosFiltradosYOrdenados(productosBase) {
  const filtroStock   = document.getElementById("filtro-stock");
  const ordenarSelect = document.getElementById("ordenar-select");
  let lista = [...productosBase];
  if (filtroStock?.checked) lista = lista.filter(p => parseInt(p.STOCK) > 0);
  lista = ordenarProductos(lista, ordenarSelect?.value || "");
  return lista;
}

/* ---------- crear tarjeta admin ---------- */
function crearCard(p) {
  const card = document.createElement("div");
  card.className      = "producto";
  card.dataset.codigo = p.CODIGO;
  if (parseInt(p.STOCK) === 0) card.classList.add("sin-stock");

  const precioVenta  = parseFloat(p.P.VENTA  || 0);
  const precioMayor  = parseFloat(p.P.LISTA3 || 0);
  const precioCosto  = parseFloat(p.P.COSTO  || 0);
  const esLiquidacion = esProductoLiquidacion(p);

  let badgeDescuento = "";
  if (esLiquidacion && parseInt(p.STOCK) > 0) {
    const precioLista2 = parseFloat(p.P.LISTA2);
    const descuento = Math.round(((precioLista2 - precioVenta) / precioLista2) * 100);
    badgeDescuento = `<div class="insignias-abajo"><div class="insignia-texto liquidacion">💸 ${descuento}% OFF</div></div>`;
  }

  /* Mayor solo es válido si LISTA3 > COSTO y LISTA3 < LISTA2 */
  const precioLista2v = parseFloat(p.P.LISTA2 || 0);
  const esMayorValido = precioMayor > 0 && precioMayor > precioCosto && precioMayor < precioLista2v;
  const filaMayor = esMayorValido
    ? `<div class="precio-fila mayor">
         <span class="label">Mayor</span><span>$${precioMayor.toLocaleString("es-AR")}</span>
       </div>`
    : "";

  card.innerHTML = `
    <a href="#" class="link-producto" onclick="event.preventDefault(); navegarProducto('${p.CODIGO}')">
      <img src="${IMG_BASE}${p.CODIGO}.webp"
        alt="${capitalizarTitulo(p.DETALLE)}"
        data-codigo="${p.CODIGO}"
        data-intento="0"
        onerror="cargarImagenAlternativa(this)">
      ${badgeDescuento}
      <h4 class="titulo-producto">${capitalizarTitulo(p.DETALLE)}</h4>
    </a>
    <div class="precios-admin">
      <div class="precio-fila venta">
        <span class="label">Venta</span><span>$${precioVenta.toLocaleString("es-AR")}</span>
      </div>
      ${filaMayor}
      <div class="precio-fila costo">
        <span class="label">Costo</span><span>$${precioCosto.toLocaleString("es-AR")}</span>
      </div>
    </div>
    <p class="stock">
      <span class="stock-left">${parseInt(p.STOCK) > 0 ? "✅ En stock" : "❌ Agotado"}</span>
      <span class="precio">📦 ${p.STOCK}</span>
    </p>
  `;

  return card;
}

/* ---------- detalle de producto ---------- */
function mostrarProducto(codigo, categorias) {
  const producto = Object.values(categorias)
    .flatMap(subs => Object.values(subs).flat())
    .find(p => p.CODIGO === codigo);
  if (!producto) return;

  const contenedor = document.getElementById("contenedor-productos");
  const precioVenta = parseFloat(producto.P.VENTA  || 0);
  const precioMayor = parseFloat(producto.P.LISTA3 || 0);
  const precioCosto = parseFloat(producto.P.COSTO  || 0);
  const precioLista2 = parseFloat(producto.P.LISTA2 || 0);
  const esLiquidacion = esProductoLiquidacion(producto) && parseInt(producto.STOCK) > 0;
  const esMayorValido = precioMayor > 0 && precioMayor > precioCosto && precioMayor < precioLista2;

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
    <div class="precios-admin" style="max-width:300px;">
      <div class="precio-fila venta">
        <span class="label">Venta</span><span>$${precioVenta.toLocaleString("es-AR")}</span>
      </div>
      ${esMayorValido ? `
      <div class="precio-fila mayor">
        <span class="label">Mayor (LISTA3)</span><span>$${precioMayor.toLocaleString("es-AR")}</span>
      </div>` : ""}
      <div class="precio-fila costo">
        <span class="label">Costo</span><span>$${precioCosto.toLocaleString("es-AR")}</span>
      </div>
      ${esLiquidacion ? `
      <div class="precio-fila" style="color:var(--celeste)">
        <span class="label">Antes (LISTA2)</span><span>$${precioLista2.toLocaleString("es-AR")}</span>
      </div>` : ""}
    </div>
    <div class="stock-e-insignias">
      <span class="stock-texto">${parseInt(producto.STOCK) > 0 ? `✅ En stock: ${producto.STOCK}` : "❌ Agotado"}</span>
      <span class="stock-texto">Código: ${producto.CODIGO}</span>
      <span class="stock-texto">IVA: ${producto["IVA"]}%</span>
      <span class="stock-texto">Stock min: ${producto["STOCK MIN"]} / ideal: ${producto["STOCK IDEAL"]}</span>
    </div>
    <div class="boton-accion">
      <button class="boton-atras" onclick="volverProducto()">
        <i class="fa-solid fa-caret-left"></i>Volver
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
    let hayProductosEnCat = false;
    const fragmentoCat = document.createDocumentFragment();

    const h2 = document.createElement("h2");
    h2.textContent = capitalizarTitulo(cat);
    fragmentoCat.appendChild(h2);

    for (const sub in categorias[cat]) {
      const lista = obtenerProductosFiltradosYOrdenados(categorias[cat][sub]);
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

/* ---------- categoría / subcategoría ---------- */
function mostrarCategoria(cat, categorias) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = `<h2>${capitalizarTitulo(cat)}</h2>`;
  for (const sub in categorias[cat]) {
    const lista = obtenerProductosFiltradosYOrdenados(categorias[cat][sub]);
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

function mostrarSubcategoria(cat, sub, categorias) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = `<h2>${capitalizarTitulo(cat)} > ${capitalizarTitulo(sub)}</h2>`;
  const lista = obtenerProductosFiltradosYOrdenados(categorias[cat][sub]);
  const grid  = document.createElement("div");
  grid.className = "productos-grid";
  lista.forEach(p => grid.appendChild(crearCard(p)));
  contenedor.appendChild(grid);
}

/* ---------- router del modo Ver Todos ---------- */
function iniciarRouterTodos(categorias) {
  const inputBuscar   = document.getElementById("input-buscar");
  const ordenarSelect = document.getElementById("ordenar-select");
  const filtroStock   = document.getElementById("filtro-stock");
  const filtros       = document.getElementById("busqueda-filtros");
  const verTodosBtn   = document.getElementById("ver-todos");

  function manejarNavegacionURL() {
    if (filtros) filtros.classList.remove("visible");

    const params   = new URLSearchParams(location.search);
    const cat      = params.get("cat");
    const sub      = params.get("sub");
    const producto = params.get("producto");
    const q        = params.get("buscar");

    if (!q && inputBuscar) inputBuscar.value = "";

    if      (q)                                    buscarProductos(q, categorias);
    else if (producto)                             mostrarProducto(producto, categorias);
    else if (cat && sub && categorias[cat]?.[sub]) mostrarSubcategoria(cat, sub, categorias);
    else if (cat && categorias[cat])               mostrarCategoria(cat, categorias);
    else                                           renderizarTodos(categorias);
  }

  verTodosBtn?.addEventListener("click", () => {
    if (filtros) filtros.classList.remove("visible");
    if (inputBuscar) inputBuscar.value = "";
    history.pushState({}, "", location.pathname);
    renderizarTodos(categorias);
    cerrarSidebarMovil();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  iniciarBusqueda(categorias);

  filtroStock?.addEventListener("change",   manejarNavegacionURL);
  ordenarSelect?.addEventListener("change", manejarNavegacionURL);

  window.navegarProducto = function (codigo) {
    if (filtros) filtros.classList.remove("visible");
    sessionStorage.setItem("scrollPos", window.scrollY);
    history.pushState({ producto: codigo }, "", `?producto=${encodeURIComponent(codigo)}`);
    mostrarProducto(codigo, categorias);
  };

  window.volverProducto = function () {
    if (window.history.length > 1) {
      history.back();
    } else {
      history.replaceState({}, "", location.pathname);
      renderizarTodos(categorias);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const posGuardada = sessionStorage.getItem("scrollPos");
  if (posGuardada) {
    window.scrollTo(0, parseInt(posGuardada));
    sessionStorage.removeItem("scrollPos");
  }

  window.addEventListener("popstate", manejarNavegacionURL);
  manejarNavegacionURL();
}

/* ---------- toggle ver costo ---------- */
function iniciarToggleCosto() {
  const toggle = document.getElementById("toggle-costo");
  if (!toggle) return;
  toggle.checked = sessionStorage.getItem("admin-ver-costo") === "1";
  document.body.classList.toggle("ver-costo", toggle.checked);

  toggle.addEventListener("change", () => {
    document.body.classList.toggle("ver-costo", toggle.checked);
    sessionStorage.setItem("admin-ver-costo", toggle.checked ? "1" : "0");
  });
}

/* ---------- iniciar modo Ver Todos ---------- */
function iniciarVerTodos() {
  iniciarToggleCosto();

  arrancar({
    onListo: (categorias, data) => {
      _categoriasTodos = categorias;
      _dataTodos       = data;

      const ordenarSelectEl = document.getElementById("ordenar-select");
      if (ordenarSelectEl) ordenarSelectEl.value = "precio-asc";

      construirSidebar(categorias);   // reutiliza tienda/js/sidebar.js
      iniciarSidebarMovil();
      iniciarRouterTodos(categorias);
    }
  });
}
