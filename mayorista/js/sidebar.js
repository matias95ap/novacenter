/* ====================================================
   sidebar.js — Construcción del menú lateral
   Depende de: config.js, filtros.js, render.js

   Comportamiento por perfil:
   - "repuestos" y "admin" → botones de filtros especiales
   - "mayor"               → categorías y subcategorías
   ==================================================== */

function construirSidebar(categorias) {
  if (PERFIL === "mayor") {
    construirSidebarCategorias(categorias);
  } else {
    construirSidebarFiltros(categorias);
  }
}

/* ---------- sidebar con filtros especiales (repuestos / admin) ---------- */
function construirSidebarFiltros(categorias) {
  const menuFiltros = document.getElementById("menu-filtros");
  const inputBuscar = document.getElementById("input-buscar");
  const filtros     = document.getElementById("busqueda-filtros");

  Object.entries(filtrosVisibles).forEach(([clave, config]) => {
    const li  = document.createElement("li");
    const btn = document.createElement("button");
    btn.className     = "btn-filtro-especial";
    btn.dataset.clave = clave;
    btn.textContent   = `👤 ${config.label}`;

    btn.addEventListener("click", () => {
      filtroActivoKey = clave;
      if (inputBuscar) inputBuscar.value = "";
      if (filtros) filtros.classList.remove("visible");
      history.pushState({}, "", `?filtro=${encodeURIComponent(clave)}`);
      renderizarFiltroEspecial(clave, categorias);
      cerrarSidebarMovil();
    });

    li.appendChild(btn);
    menuFiltros.appendChild(li);
  });
}

/* ---------- sidebar con categorías (perfil "mayor") ---------- */
function construirSidebarCategorias(categorias) {
  const menu        = document.getElementById("menu-categorias");
  const inputBuscar = document.getElementById("input-buscar");
  const filtros     = document.getElementById("busqueda-filtros");

  // Ocultar la sección de filtros especiales en el sidebar
  const labelFiltros = document.querySelector(".label-filtros");
  const menuFiltros  = document.getElementById("menu-filtros");
  const bordeExtra   = document.querySelector(".borde-extra");
  if (labelFiltros) labelFiltros.style.display = "none";
  if (menuFiltros)  menuFiltros.style.display  = "none";
  if (bordeExtra)   bordeExtra.style.display   = "none";

  for (const cat in categorias) {
    // Verificar que la categoría tenga al menos un producto visible para este perfil
    const tieneProductos = Object.entries(categorias[cat]).some(([sub, prods]) => {
      return prods.some(p => {
        const pmayor  = parseFloat(p.P.LISTA3 || 0);
        const plista2 = parseFloat(p.P.LISTA2 || 0);
        const pcosto  = parseFloat(p.P.COSTO  || 0);
        if (pmayor <= 0 || pmayor <= pcosto || pmayor >= plista2) return false;
        if (SUBCATS_REPUESTOS.includes(p.FAMILIA)) return false;
        return true;
      });
    });
    if (!tieneProductos) continue;

    const li     = document.createElement("li");
    const header = document.createElement("div");
    header.className = "menu-completo";

    const aCat = document.createElement("a");
    aCat.className   = "menu-categoria";
    aCat.textContent = capitalizarTitulo(cat);
    aCat.href        = "#";
    aCat.addEventListener("click", e => {
      e.preventDefault();
      filtroActivoKey = null;
      if (filtros) filtros.classList.remove("visible");
      if (inputBuscar) inputBuscar.value = "";
      history.pushState({}, "", `?cat=${encodeURIComponent(cat)}`);
      mostrarCategoria(cat, categorias);
      cerrarSidebarMovil();
    });

    const toggle = document.createElement("button");
    toggle.className   = "botonflecha";
    toggle.textContent = "⬇️";
    toggle.style.cssText = "background:none;border:none;color:white;cursor:pointer";
    toggle.addEventListener("click", e => {
      e.stopPropagation();
      li.classList.toggle("active");
      toggle.textContent = li.classList.contains("active") ? "⬆️" : "⬇️";
    });

    header.appendChild(aCat);
    header.appendChild(toggle);
    li.appendChild(header);

    const subUl = document.createElement("ul");
    subUl.className = "submenu";

    for (const sub in categorias[cat]) {
      const familia = `${cat} > ${sub}`;
      if (SUBCATS_REPUESTOS.includes(familia)) continue; // excluir repuestos

      const subLi = document.createElement("li");
      const subA  = document.createElement("a");
      subA.className   = "menu-subcategoria";
      subA.textContent = capitalizarTitulo(sub);
      subA.href        = "#";
      subA.addEventListener("click", e => {
        e.preventDefault();
        filtroActivoKey = null;
        if (filtros) filtros.classList.remove("visible");
        if (inputBuscar) inputBuscar.value = "";
        history.pushState({}, "", `?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}`);
        mostrarSubcategoria(cat, sub, categorias);
        cerrarSidebarMovil();
      });
      subLi.appendChild(subA);
      subUl.appendChild(subLi);
    }

    li.appendChild(subUl);
    menu.appendChild(li);
  }
}

/* ---------- helpers móvil ---------- */
function cerrarSidebarMovil() {
  if (window.innerWidth <= 600) {
    sidebar.classList.remove("abierto");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function iniciarSidebarMovil() {
  const sidebar       = document.getElementById("sidebar");
  const toggleMenu    = document.getElementById("toggle-menu");
  const toggleFiltros = document.getElementById("toggle-filtros");
  const filtros       = document.getElementById("busqueda-filtros");

  /* --- FIX animación al cargar ---
     Desactiva transición, oculta sin animación, reactiva después */
  if (window.innerWidth <= 600) {
    sidebar.style.transition = "none";
    sidebar.classList.add("oculto");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sidebar.style.transition = "";
      });
    });
  }

  function controlarSidebar() {
    const topbarMovil = document.getElementById("topbar-movil");
    if (window.getComputedStyle(topbarMovil).display === "none") {
      sidebar.style.transition = "none";
      sidebar.classList.remove("oculto");
      requestAnimationFrame(() => requestAnimationFrame(() => { sidebar.style.transition = ""; }));
    }
  }
  window.addEventListener("resize", controlarSidebar);

  /* --- Toggle menú hamburguesa --- */
  toggleMenu?.addEventListener("click", () => {
    sidebar.classList.toggle("abierto");
    filtros.classList.remove("visible"); // cierra el buscador al abrir el menú
  });

  /* --- FIX lupa: oculta sidebar y muestra buscador --- */
  toggleFiltros?.addEventListener("click", () => {
    sidebar.classList.remove("abierto");
    filtros.classList.toggle("visible");
  });

  /* --- Swipe hacia abajo para mostrar buscador --- */
  let startY = null, dragging = false;
  document.addEventListener("touchstart", e => {
    if (window.scrollY === 0) { startY = e.touches[0].clientY; dragging = true; }
  });
  document.addEventListener("touchmove", e => {
    if (!dragging || startY === null) return;
    if (e.touches[0].clientY - startY > 60) {
      filtros.classList.add("visible");
      dragging = false;
    }
  });
  document.addEventListener("touchend", () => { startY = null; dragging = false; });
  window.addEventListener("scroll", () => {
    if (filtros.classList.contains("visible")) filtros.classList.remove("visible");
  });
}
