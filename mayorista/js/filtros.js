/* ====================================================
   filtros.js — Lógica de filtrado y ordenamiento
   Depende de: config.js
   ==================================================== */

/* ---------- estado global del filtro activo ---------- */
let filtroActivoKey = null; // null = modo Ver Todos

/* ---------- ordenar lista de productos ---------- */
function ordenarProductos(lista, criterio) {
  switch (criterio) {
    case "precio-asc":
      return lista.sort((a, b) => parseFloat(a.P.LISTA3 || a.P.LISTA2) - parseFloat(b.P.LISTA3 || b.P.LISTA2));
    case "precio-desc":
      return lista.sort((a, b) => parseFloat(b.P.LISTA3 || b.P.LISTA2) - parseFloat(a.P.LISTA3 || a.P.LISTA2));
    case "nombre-asc":
      return lista.sort((a, b) => a.DETALLE.localeCompare(b.DETALLE));
    case "nombre-desc":
      return lista.sort((a, b) => b.DETALLE.localeCompare(a.DETALLE));
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
  if (filtroStock?.checked)
    lista = lista.filter(p => parseInt(p.STOCK) > 0);
  lista = ordenarProductos(lista, ordenarSelect?.value || "");
  return lista;
}

/* ---------- filtro principal mayorista ----------
   Aplica en orden:
   1. Precio válido (LISTA3 > COSTO y LISTA3 < LISTA2)
   2. Perfil de login (repuestos / kiosko / admin)
   3. Filtro especial activo (incluir / excluir subcats)
   4. Búsqueda de texto                                  */
function aplicarFiltroMayorista(productosBase, busqueda = "") {
  const config = filtroActivoKey ? filtrosEspeciales[filtroActivoKey] : null;
  const subcategoriasIncluir = config?.incluir || null;
  const subcategoriasExcluir = config?.excluir || null;

  return productosBase.filter(p => {
    // 1. Precio mayorista válido
    const pmayor = parseFloat(p.P.LISTA3 || 0);
    const plista2 = parseFloat(p.P.LISTA2 || 0);
    const pcosto  = parseFloat(p.P.COSTO  || 0);
    if (pmayor <= 0 || pmayor <= pcosto || pmayor >= plista2) return false;

    // 2. Filtro por perfil de login (solo en modo Ver Todos / categoría)
    if (!filtroActivoKey) {
      if (PERFIL === "repuestos" && !SUBCATS_REPUESTOS.includes(p.FAMILIA)) return false;
      if (PERFIL === "kiosko"    &&  SUBCATS_REPUESTOS.includes(p.FAMILIA)) return false;
      // PERFIL === "admin" ve todo
    }

    // 3. Filtros especiales por cliente
    if (subcategoriasIncluir && !subcategoriasIncluir.includes(p.FAMILIA)) return false;
    if (subcategoriasExcluir &&  subcategoriasExcluir.includes(p.FAMILIA)) return false;

    // 4. Búsqueda de texto
    if (busqueda) {
      const b = busqueda.toLowerCase();
      if (!p.DETALLE.toLowerCase().includes(b) && !p.CODIGO.toLowerCase().includes(b)) return false;
    }

    return true;
  });
}
