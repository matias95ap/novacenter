/* ====================================================
   router.js — Navegación por URL y eventos (mayorista)
   Depende de: config.js, filtros.js, render.js
   Usa: shared/busqueda.js
   ==================================================== */

function iniciarRouter(categorias) {
  const inputBuscar   = document.getElementById("input-buscar");
  const ordenarSelect = document.getElementById("ordenar-select");
  const filtroStock   = document.getElementById("filtro-stock");
  const filtros       = document.getElementById("busqueda-filtros");
  const verTodosBtn   = document.getElementById("ver-todos");

  /* ---------- leer URL y renderizar la vista correcta ---------- */
  function manejarNavegacionURL() {
    if (filtros) filtros.classList.remove("visible");

    const params        = new URLSearchParams(location.search);
    const filtroParam   = params.get("filtro");
    const cat           = params.get("cat");
    const sub           = params.get("sub");
    const productoParam = params.get("producto");
    const q             = params.get("buscar");

    // Limpiar buscador salvo que la URL sea de búsqueda
    if (!q && inputBuscar) inputBuscar.value = "";

    if (filtroParam && filtrosEspeciales[filtroParam]) {
      filtroActivoKey = filtroParam;
      renderizarFiltroEspecial(filtroParam, categorias);
    } else if (q) {
      buscarProductos(q, categorias, aplicarFiltroMayorista);
    } else if (productoParam) {
      mostrarProducto(productoParam, categorias);
    } else if (cat && sub && categorias[cat]?.[sub]) {
      filtroActivoKey = null;
      mostrarSubcategoria(cat, sub, categorias);
    } else if (cat && categorias[cat]) {
      filtroActivoKey = null;
      mostrarCategoria(cat, categorias);
    } else {
      filtroActivoKey = null;
      renderizarTodos(categorias);
    }
  }

  /* ---------- botón Ver Todos ---------- */
  verTodosBtn?.addEventListener("click", () => {
    filtroActivoKey = null;
    if (filtros) filtros.classList.remove("visible");
    if (inputBuscar) inputBuscar.value = "";
    history.pushState({}, "", location.pathname);
    renderizarTodos(categorias);
    cerrarSidebarMovil();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- búsqueda (delegada a shared/busqueda.js) ----------
     Se pasa aplicarFiltroMayorista como filtro extra              */
  iniciarBusqueda(categorias, aplicarFiltroMayorista);

  /* ---------- filtro stock y orden ---------- */
  filtroStock?.addEventListener("change",   manejarNavegacionURL);
  ordenarSelect?.addEventListener("change", manejarNavegacionURL);

  /* ---------- navegación a producto ---------- */
  window.navegarProducto = function (codigo) {
    if (filtros) filtros.classList.remove("visible");
    if (inputBuscar) inputBuscar.value = "";
    sessionStorage.setItem("scrollPos", window.scrollY);
    history.pushState({ producto: codigo }, "", `?producto=${encodeURIComponent(codigo)}`);
    mostrarProducto(codigo, categorias);
  };

  /* ---------- volver ---------- */
  window.volverProducto = function () {
    if (inputBuscar) inputBuscar.value = "";
    if (window.history.length > 1) {
      history.back();
    } else {
      history.replaceState({}, "", location.pathname);
      renderizarTodos(categorias);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ---------- restaurar scroll ---------- */
  const posGuardada = sessionStorage.getItem("scrollPos");
  if (posGuardada) {
    window.scrollTo(0, parseInt(posGuardada));
    sessionStorage.removeItem("scrollPos");
  }

  /* ---------- popstate ---------- */
  window.addEventListener("popstate", manejarNavegacionURL);

  /* ---------- arrancar ---------- */
  manejarNavegacionURL();
}
