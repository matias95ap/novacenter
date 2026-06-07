/* ====================================================
   shared/arrancar.js — Lógica común de inicio
   Compartido entre tienda, mayorista y admin
   Requiere: config-global.js, excluidos.js

   Uso:
     arrancar({ 
       onListo: (categorias, data) => { ... }  ← callback con datos listos
       filtrar: (p) => true                     ← filtro extra opcional
     });
   ==================================================== */

function arrancar({ onListo, filtrar = null } = {}) {
  fetch(JSON_BASE + "productos.json")
    .then(res => res.json())
    .then(data => {

      /* --- filtrar excluidos (desde shared/excluidos.js) --- */
      data = data.filter(p => !CODIGOS_EXCLUIDOS.includes(p.CODIGO));

      /* --- filtro extra si se pasa (ej: mayorista filtra por precio) --- */
      if (typeof filtrar === "function") {
        data = data.filter(filtrar);
      }

      /* --- agrupar por categoría > subcategoría --- */
      const categorias = {};
      data.forEach(p => {
        const [cat, sub = "VARIOS"] = p.FAMILIA.split(" > ");
        if (!categorias[cat])      categorias[cat]      = {};
        if (!categorias[cat][sub]) categorias[cat][sub] = [];
        categorias[cat][sub].push(p);
      });

      /* --- callback con datos listos --- */
      if (typeof onListo === "function") {
        onListo(categorias, data);
      }
    })
    .catch(err => console.error("Error cargando productos.json:", err));
}
