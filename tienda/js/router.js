/* ====================================================
   router.js — Navegación por URL y eventos (tienda)
   Depende de: config.js, filtros.js, render.js
   Usa: shared/busqueda.js
   ==================================================== */

function iniciarRouter(categorias, data) {
  const inputBuscar   = document.getElementById("input-buscar");
  const ordenarSelect = document.getElementById("ordenar-select");
  const filtroStock   = document.getElementById("filtro-stock");
  const filtros       = document.getElementById("busqueda-filtros");
  const verTodosBtn   = document.getElementById("ver-todos");
  const verNuevosBtn  = document.getElementById("ver-nuevos");
  const verLiqBtn     = document.getElementById("ver-liquidacion");
  const verNinoBtn    = document.getElementById("ver-dia-nino");

  /* ---------- leer URL y renderizar la vista correcta ---------- */
  function manejarNavegacionURL() {
    if (filtros) filtros.classList.remove("visible");

    const params      = new URLSearchParams(location.search);
    const cat         = params.get("cat");
    const sub         = params.get("sub");
    const producto    = params.get("producto");
    const q           = params.get("buscar");
    const verNuevos   = params.get("nuevos");
    const verDiaNino  = params.get("dianino");
    const verLiquidac = params.get("liquidacion");

    // Limpiar buscador salvo que la URL sea de búsqueda
    if (!q && inputBuscar) inputBuscar.value = "";

    if      (verNuevos   === "1") mostrarNuevos(data);
    else if (verDiaNino  === "1") mostrarDiaDelNino(data);
    else if (verLiquidac === "1") mostrarLiquidacion(data);
    else if (q)                   buscarProductos(q, categorias);
    else if (producto)            mostrarProducto(producto, categorias);
    else if (cat && sub && categorias[cat]?.[sub]) mostrarSubcategoria(cat, sub, categorias);
    else if (cat && categorias[cat])               mostrarCategoria(cat, categorias);
    else                          renderizarTodos(categorias);
  }

  /* ---------- botones del sidebar ---------- */
  verTodosBtn?.addEventListener("click", () => {
    if (filtros) filtros.classList.remove("visible");
    if (inputBuscar) inputBuscar.value = "";
    history.pushState({}, "", location.pathname);
    renderizarTodos(categorias);
    cerrarSidebarMovil();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  verNuevosBtn?.addEventListener("click", () => {
    if (inputBuscar) inputBuscar.value = "";
    history.pushState({}, "", "?nuevos=1");
    mostrarNuevos(data);
    cerrarSidebarMovil();
  });

  verLiqBtn?.addEventListener("click", () => {
    if (inputBuscar) inputBuscar.value = "";
    history.pushState({}, "", "?liquidacion=1");
    mostrarLiquidacion(data);
    cerrarSidebarMovil();
  });

  verNinoBtn?.addEventListener("click", () => {
    if (inputBuscar) inputBuscar.value = "";
    history.pushState({}, "", "?dianino=1");
    mostrarDiaDelNino(data);
    cerrarSidebarMovil();
  });

  /* ---------- búsqueda (delegada a shared/busqueda.js) ---------- */
  iniciarBusqueda(categorias);

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
