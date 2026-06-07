/* ====================================================
   script.js — Punto de entrada (mayorista)
   Usa: shared/arrancar.js, shared/excluidos.js
   ==================================================== */

arrancar({
  onListo: (categorias, data) => {

    /* --- construir sidebar según perfil --- */
    construirSidebar(categorias);

    /* --- iniciar sidebar móvil --- */
    iniciarSidebarMovil();

    /* --- iniciar router --- */
    iniciarRouter(categorias);
  }
});
