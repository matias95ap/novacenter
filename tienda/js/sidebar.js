/* ====================================================
   sidebar.js — Construcción del menú lateral
   Depende de: render.js
   ==================================================== */

function construirSidebar(categorias) {
  const menu = document.getElementById("menu-categorias");

  for (const cat in categorias) {
    const li     = document.createElement("li");
    const header = document.createElement("div");
    header.className = "menu-completo";

    const aCat = document.createElement("a");
    aCat.className   = "menu-categoria";
    aCat.textContent = capitalizarTitulo(cat);
    aCat.href        = "#";
    aCat.addEventListener("click", e => {
      e.preventDefault();
      const filtros = document.getElementById("busqueda-filtros");
      const inputBuscar = document.getElementById("input-buscar");
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
      // Ocultar subcategorías excluidas en el sidebar
      if (SUBCATS_EXCLUIDAS.includes(`${cat} > ${sub}`)) continue;

      const subLi = document.createElement("li");
      const subA  = document.createElement("a");
      subA.className   = "menu-subcategoria";
      subA.textContent = capitalizarTitulo(sub);
      subA.href        = "#";
      subA.addEventListener("click", e => {
        e.preventDefault();
        const filtros = document.getElementById("busqueda-filtros");
        const inputBuscar = document.getElementById("input-buscar");
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

function cerrarSidebarMovil() {
  if (window.innerWidth <= 600) {
    document.getElementById("sidebar").classList.add("oculto");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function iniciarSidebarMovil() {
  const sidebar       = document.getElementById("sidebar");
  const filtros       = document.getElementById("busqueda-filtros");
  const toggleFiltros = document.getElementById("toggle-filtros");

  if (window.innerWidth <= 600) sidebar.classList.add("oculto");

  function controlarSidebar() {
    const topbarMovil = document.getElementById("topbar-movil");
    if (window.getComputedStyle(topbarMovil).display === "none") {
      sidebar.classList.remove("oculto");
    }
  }
  window.addEventListener("resize", controlarSidebar);
  window.addEventListener("load", controlarSidebar);

  document.getElementById("toggle-menu")
    ?.addEventListener("click", () => sidebar.classList.toggle("oculto"));

  toggleFiltros?.addEventListener("click", () => {
    filtros.classList.toggle("visible");
    filtros.classList.toggle("oculto");
  });

  let startY = null, dragging = false;
  document.addEventListener("touchstart", e => {
    if (window.scrollY === 0) { startY = e.touches[0].clientY; dragging = true; }
  });
  document.addEventListener("touchmove", e => {
    if (!dragging || startY === null) return;
    if (e.touches[0].clientY - startY > 60) {
      filtros.classList.add("visible");
      filtros.classList.remove("oculto");
      dragging = false;
    }
  });
  document.addEventListener("touchend", () => { startY = null; dragging = false; });
  window.addEventListener("scroll", () => {
    if (filtros.classList.contains("visible")) filtros.classList.remove("visible");
  });
}
