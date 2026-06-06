/* ====================================================
   script.js — Punto de entrada de la tienda
   ==================================================== */

Promise.all([
  fetch(JSON_BASE + "productos.json").then(res => res.json()),
  fetch(JSON_BASE + "excluidos.json").then(res => res.json())
])
  .then(([data, codigosExcluidos]) => {

    /* --- filtrar excluidos --- */
    data = data.filter(p => !codigosExcluidos.includes(p.CODIGO));

    /* --- agrupar por categoría > subcategoría --- */
    const categorias = {};
    data.forEach(p => {
      const [cat, sub = "VARIOS"] = p.FAMILIA.split(" > ");
      if (!categorias[cat])      categorias[cat]      = {};
      if (!categorias[cat][sub]) categorias[cat][sub] = [];
      categorias[cat][sub].push(p);
    });

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

  })
  .catch(err => console.error("Error cargando datos:", err));
