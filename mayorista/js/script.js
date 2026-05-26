/* ====================================================
   script.js — Punto de entrada principal
   Carga los datos y arranca los módulos en orden
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
      if (!categorias[cat])       categorias[cat]       = {};
      if (!categorias[cat][sub])  categorias[cat][sub]  = [];
      categorias[cat][sub].push(p);
    });

    /* --- construir sidebar --- */
    construirSidebar(categorias);
    // construirSidebarCategorias(categorias); // descomentá para ver categorías en el menú

    /* --- iniciar sidebar móvil --- */
    iniciarSidebarMovil();

    /* --- iniciar router (navegación + búsqueda + eventos) --- */
    iniciarRouter(categorias);

  })
  .catch(err => console.error("Error cargando datos:", err));
