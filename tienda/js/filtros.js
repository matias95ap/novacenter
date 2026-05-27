/* ====================================================
   filtros.js — Lógica de filtrado y ordenamiento
   Depende de: config.js
   ==================================================== */

/* ---------- liquidación ----------
   Un producto es liquidación cuando lista2 > venta
   (lista2 es el precio anterior, venta es el rebajado) */
function esProductoLiquidacion(p) {
  const lista2 = parseFloat(p.P.LISTA2);
  const venta  = parseFloat(p.P.VENTA);
  return lista2 > venta;
}

/* ---------- ordenar lista de productos ---------- */
function ordenarProductos(lista, criterio) {
  switch (criterio) {
    case "precio-asc":
      return lista.sort((a, b) => parseFloat(a.P.VENTA) - parseFloat(b.P.VENTA));
    case "precio-desc":
      return lista.sort((a, b) => parseFloat(b.P.VENTA) - parseFloat(a.P.VENTA));
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

/* ---------- aplicar exclusiones, stock y orden ---------- */
function obtenerProductosFiltradosYOrdenados(productosBase) {
  const filtroStock   = document.getElementById("filtro-stock");
  const ordenarSelect = document.getElementById("ordenar-select");
  let lista = [...productosBase];
  // Excluir subcategorías definidas en config.js
  lista = lista.filter(p => !SUBCATS_EXCLUIDAS.includes(p.FAMILIA));
  if (filtroStock?.checked)
    lista = lista.filter(p => parseInt(p.STOCK) > 0);
  lista = ordenarProductos(lista, ordenarSelect?.value || "");
  return lista;
}
