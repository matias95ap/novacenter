/* ====================================================
   shared/busqueda.js — Búsqueda compartida
   Funciona para tienda y mayorista.
   Requiere: capitalizarTitulo (shared/capitalizar.js)
   Requiere en tienda:    crearCard, obtenerProductosFiltradosYOrdenados
   Requiere en mayorista: crearCard, aplicarFiltroMayorista, obtenerProductosFiltradosYOrdenados
   ==================================================== */

/* ---------- buscar y renderizar resultados ----------
   filtrarFn: función opcional para filtrado extra (mayorista la usa)
   Si no se pasa, filtra solo por texto                              */
function buscarProductos(termino, categorias, filtrarFn = null) {
  const t = termino.toLowerCase().trim();
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "";

  // Agrupar resultados por cat > sub aplicando filtros
  const agrupados = {};
  for (const cat in categorias) {
    for (const sub in categorias[cat]) {
      const familia = `${cat} > ${sub}`;
      let lista = categorias[cat][sub].map(p => ({ ...p, FAMILIA: p.FAMILIA || familia }));

      // Aplicar filtro extra si existe (mayorista)
      if (typeof filtrarFn === "function") {
        lista = filtrarFn(lista, t);
      } else {
        // Filtro de texto simple para tienda
        lista = lista.filter(p =>
          p.DETALLE.toLowerCase().includes(t) || p.CODIGO.toLowerCase().includes(t)
        );
      }

      lista = obtenerProductosFiltradosYOrdenados(lista);
      if (!lista.length) continue;

      if (!agrupados[cat]) agrupados[cat] = {};
      agrupados[cat][sub] = lista;
    }
  }

  if (!Object.keys(agrupados).length) {
    const p = document.createElement("p");
    p.textContent = "No se encontraron resultados.";
    contenedor.appendChild(p);
    return;
  }

  for (const cat in agrupados) {
    const fragmentoCat = document.createDocumentFragment();
    const h2 = document.createElement("h2");
    h2.textContent = capitalizarTitulo(cat);
    fragmentoCat.appendChild(h2);

    for (const sub in agrupados[cat]) {
      const h3 = document.createElement("h3");
      h3.textContent = capitalizarTitulo(sub);
      fragmentoCat.appendChild(h3);

      const grid = document.createElement("div");
      grid.className = "productos-grid";
      agrupados[cat][sub].forEach(p => grid.appendChild(crearCard(p)));
      fragmentoCat.appendChild(grid);
    }

    contenedor.appendChild(fragmentoCat);
  }
}

/* ---------- iniciar búsqueda con URL y debounce ----------
   filtrarFn: igual que arriba, opcional                    */
function iniciarBusqueda(categorias, filtrarFn = null) {
  const inputBuscar = document.getElementById("input-buscar");
  const filtros     = document.getElementById("busqueda-filtros");
  if (!inputBuscar) return;

  let urlAntesDeBusqueda = null;
  let timerBusqueda      = null;

  inputBuscar.addEventListener("input", e => {
    clearTimeout(timerBusqueda);
    const termino = e.target.value.trim();

    if (termino.length === 1) return;

    if (termino.length >= 2) {
      // Guardar URL actual antes de buscar (para poder volver)
      if (!location.search.startsWith("?buscar=")) {
        urlAntesDeBusqueda = location.href;
      }
      // Debounce: espera 300ms antes de buscar
      timerBusqueda = setTimeout(() => {
        history.replaceState({}, "", `?buscar=${encodeURIComponent(termino)}`);
        buscarProductos(termino, categorias, filtrarFn);
      }, 300);

    } else {
      // Campo vacío → volver a la vista anterior
      clearTimeout(timerBusqueda);
      if (location.search.startsWith("?buscar=")) {
        if (urlAntesDeBusqueda) {
          history.pushState({}, "", urlAntesDeBusqueda);
          urlAntesDeBusqueda = null;
          // Disparar popstate manualmente para que el router recargue la vista
          window.dispatchEvent(new PopStateEvent("popstate", { state: history.state }));
        } else {
          history.replaceState({}, "", location.pathname);
          window.dispatchEvent(new PopStateEvent("popstate", { state: history.state }));
        }
      }
    }
  });

  // Si la página cargó con ?buscar= en la URL (link compartido)
  const params = new URLSearchParams(location.search);
  const q = params.get("buscar");
  if (q) {
    inputBuscar.value = q;
    buscarProductos(q, categorias, filtrarFn);
  }
}
