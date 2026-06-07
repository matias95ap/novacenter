/* ====================================================
   script.js — Punto de entrada (tienda)
   Usa: shared/arrancar.js, shared/excluidos.js
   ==================================================== */

arrancar({
  onListo: (categorias, data) => {

    /* --- activar filtros por defecto --- */
    const filtroStockEl = document.getElementById("filtro-stock");
    if (filtroStockEl) filtroStockEl.checked = true;
    const ordenarSelectEl = document.getElementById("ordenar-select");
    if (ordenarSelectEl) ordenarSelectEl.value = "precio-asc";

    /* --- construir sidebar --- */
    construirSidebar(categorias);

    /* --- iniciar sidebar móvil --- */
    iniciarSidebarMovil();

    /* --- iniciar router --- */
    iniciarRouter(categorias, data);
  }
});
