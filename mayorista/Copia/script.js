/* -------   script.js - MAYORISTA   -------- */

const IMG_BASE    = "../tienda/img/";
const JSON_BASE   = "../tienda/";
const WP_NUMBER   = "5493772582822";
const TIENDA_BASE = "https://novacenter.ar/tienda/";

Promise.all([
  fetch(JSON_BASE + "productos.json").then(res => res.json()),
  fetch(JSON_BASE + "excluidos.json").then(res => res.json())
])
  .then(([data, codigosExcluidos]) => {

    /* ---------- excluidos ---------- */
    data = data.filter(p => !codigosExcluidos.includes(p.CODIGO));

    /* ---------- referencias DOM ---------- */
    const menu           = document.getElementById("menu-categorias");
    const menuFiltros    = document.getElementById("menu-filtros");
    const contenedor     = document.getElementById("contenedor-productos");
    const verTodosBtn    = document.getElementById("ver-todos");
    const inputBuscar    = document.getElementById("input-buscar");
    const ordenarSelect  = document.getElementById("ordenar-select");
    const filtroStock    = document.getElementById("filtro-stock");
    const filtros        = document.getElementById("busqueda-filtros");
    const toggleFiltros  = document.getElementById("toggle-filtros");

    /* ---------- configuración mayorista ---------- */

    // Subcategorías excluidas del modo @mayorista general
    /* ---------- perfil de acceso desde login ---------- */
    const PERFIL = sessionStorage.getItem("mayorista-perfil") || "kiosko";

    const SUBCATS_REPUESTOS = [
      "CELULAR Y COMPUTACION > MODULOS DISPLAY",
      "CELULAR Y COMPUTACION > BATERIAS",
      "CELULAR Y COMPUTACION > REPUESTOS CEL",
      "CELULAR Y COMPUTACION > HERRAMIENTAS E INSUMOS",
      "CELULAR Y COMPUTACION > PLACA DE CARGA"
    ];

    const subcategoriasExcluidasMayorista = [
      "CELULAR Y COMPUTACION > MODULOS DISPLAY",
      "CELULAR Y COMPUTACION > BATERIAS",
      "CELULAR Y COMPUTACION > REPUESTOS CEL",
      "CELULAR Y COMPUTACION > HERRAMIENTAS E INSUMOS",
      "CELULAR Y COMPUTACION > PLACA DE CARGA"
    ];

    // Filtros especiales por cliente
    const filtrosEspeciales = {
      "@acc": {
        label: "Electronica y Acc",
        excluir: [
          "CELULAR Y COMPUTACION > MODULOS DISPLAY",
          "CELULAR Y COMPUTACION > BATERIAS",
          "CELULAR Y COMPUTACION > REPUESTOS CEL",
          "CELULAR Y COMPUTACION > HERRAMIENTAS E INSUMOS",
          "CELULAR Y COMPUTACION > PLACA DE CARGA"
        ]
      },
      "@Tecnico": {
        label: "Reparacion",
        incluir: [
          "CELULAR Y COMPUTACION > MODULOS DISPLAY",
          "CELULAR Y COMPUTACION > BATERIAS",
          "CELULAR Y COMPUTACION > REPUESTOS CEL",
          "CELULAR Y COMPUTACION > HERRAMIENTAS E INSUMOS",
          "CELULAR Y COMPUTACION > PLACA DE CARGA"
        ]
      },
      "@modulos": {
        label: "Modulos",
        incluir: [
          "CELULAR Y COMPUTACION > MODULOS DISPLAY"
        ]
      },
      "@baterias": {
        label: "Baterias",
        incluir: [
          "CELULAR Y COMPUTACION > BATERIAS"
        ]
      },
      "@Repuestos": {
        label: "Repuestos Chicos",
        incluir: [
          "CELULAR Y COMPUTACION > REPUESTOS CEL"
        ]
      },
    };

    /* ---------- estado global del filtro activo ---------- */
    let filtroActivoKey = null; // null = modo @mayorista general

    /* ---------- agrupar categorías / subcategorías ---------- */
    const categorias = {};
    data.forEach(p => {
      const [cat, sub = "VARIOS"] = p.FAMILIA.split(" > ");
      if (!categorias[cat]) categorias[cat] = {};
      if (!categorias[cat][sub]) categorias[cat][sub] = [];
      categorias[cat][sub].push(p);
    });

    /* ---------- helpers ---------- */
    function capitalizarTitulo(str) {
      const minusculas = ["y", "a", "o", "de", "para", "en", "con"];
      const mayusculas = ["hdmi", "vga", "rca", "gb", "rgb", "led", "otg", "ps2", "pc", "sata", "sd", "usb", "ok"];
      return str.toLowerCase().split(" ").map(pal => {
        if (mayusculas.includes(pal)) return pal.toUpperCase();
        if (minusculas.includes(pal)) return pal;
        return pal.charAt(0).toUpperCase() + pal.slice(1);
      }).join(" ");
    }

    function ordenarProductos(lista, criterio) {
      switch (criterio) {
        case "precio-asc":  return lista.sort((a, b) => parseFloat(a.P.LISTA3 || a.P.LISTA2) - parseFloat(b.P.LISTA3 || b.P.LISTA2));
        case "precio-desc": return lista.sort((a, b) => parseFloat(b.P.LISTA3 || b.P.LISTA2) - parseFloat(a.P.LISTA3 || a.P.LISTA2));
        case "nombre-asc":  return lista.sort((a, b) => a.DETALLE.localeCompare(b.DETALLE));
        case "nombre-desc": return lista.sort((a, b) => b.DETALLE.localeCompare(a.DETALLE));
        default:
          const conStock = lista.filter(p => parseInt(p.STOCK) > 0);
          const sinStock = lista.filter(p => parseInt(p.STOCK) === 0);
          return [...conStock, ...sinStock];
      }
    }

    function obtenerProductosFiltradosYOrdenados(productosBase) {
      let lista = [...productosBase];
      if (filtroStock && filtroStock.checked)
        lista = lista.filter(p => parseInt(p.STOCK) > 0);
      lista = ordenarProductos(lista, ordenarSelect?.value || "");
      return lista;
    }

    /* ---------- filtrar datos según el filtro activo ---------- */
    function aplicarFiltroMayorista(productosBase, busqueda = "") {
      const config = filtroActivoKey ? filtrosEspeciales[filtroActivoKey] : null;
      const subcategoriasIncluir = config?.incluir || null;
      const subcategoriasExcluir = config?.excluir || null;

      return productosBase.filter(p => {
        // precio mayorista válido
        const pmayor = parseFloat(p.P.LISTA3 || 0);
        const plista2 = parseFloat(p.P.LISTA2 || 0);
        const pcosto = parseFloat(p.P.COSTO || 0);
        if (pmayor <= 0 || pmayor <= pcosto || pmayor >= plista2) return false;

        // filtro por perfil de login
        if (!filtroActivoKey) {
          if (PERFIL === "repuestos" && !SUBCATS_REPUESTOS.includes(p.FAMILIA)) return false;
          if (PERFIL === "kiosko"    &&  SUBCATS_REPUESTOS.includes(p.FAMILIA)) return false;
          // PERFIL === "admin" ve todo
        }

        // filtros especiales
        if (subcategoriasIncluir && !subcategoriasIncluir.includes(p.FAMILIA)) return false;
        if (subcategoriasExcluir && subcategoriasExcluir.includes(p.FAMILIA)) return false;

        // búsqueda de texto
        if (busqueda) {
          const b = busqueda.toLowerCase();
          if (!p.DETALLE.toLowerCase().includes(b) && !p.CODIGO.toLowerCase().includes(b)) return false;
        }

        return true;
      });
    }

    /* ---------- renderizar todos ---------- */
    function renderizarTodos(busqueda = "") {
      contenedor.innerHTML = "";
      marcarFiltroActivo(null);

      for (const cat in categorias) {
        let hayProductosEnCat = false;
        const fragmentoCat = document.createDocumentFragment();

        const h2 = document.createElement("h2");
        h2.textContent = capitalizarTitulo(cat);
        fragmentoCat.appendChild(h2);

        for (const sub in categorias[cat]) {
          const familia = `${cat} > ${sub}`;
          const productosOriginales = categorias[cat][sub].map(p => ({ ...p, FAMILIA: p.FAMILIA || familia }));
          let lista = aplicarFiltroMayorista(productosOriginales, busqueda);
          lista = obtenerProductosFiltradosYOrdenados(lista);
          if (!lista.length) continue;

          hayProductosEnCat = true;
          const h3 = document.createElement("h3");
          h3.textContent = capitalizarTitulo(sub);
          fragmentoCat.appendChild(h3);

          const grid = document.createElement("div");
          grid.className = "productos-grid";
          lista.forEach(p => grid.appendChild(crearCard(p)));
          fragmentoCat.appendChild(grid);
        }

        if (hayProductosEnCat) contenedor.appendChild(fragmentoCat);
      }

      if (!contenedor.children.length) {
        const p = document.createElement("p");
        p.textContent = "No se encontraron productos.";
        contenedor.appendChild(p);
      }
    }

    /* ---------- renderizar con filtro especial ---------- */
    function renderizarFiltroEspecial(clave, busqueda = "") {
      filtroActivoKey = clave;
      marcarFiltroActivo(clave);

      const config = filtrosEspeciales[clave];
      contenedor.innerHTML = `<h2>👤 ${config.label}</h2>`;

      // Agrupar todos los productos por categoría > subcategoría
      const agrupado = {};
      Object.entries(categorias).forEach(([cat, subs]) => {
        Object.entries(subs).forEach(([sub, prods]) => {
          const familia = `${cat} > ${sub}`;
          prods.forEach(p => {
            const pp = { ...p, FAMILIA: p.FAMILIA || familia };
            if (!agrupado[cat]) agrupado[cat] = {};
            if (!agrupado[cat][sub]) agrupado[cat][sub] = [];
            agrupado[cat][sub].push(pp);
          });
        });
      });

      let hayAlgo = false;
      for (const cat in agrupado) {
        for (const sub in agrupado[cat]) {
          let lista = aplicarFiltroMayorista(agrupado[cat][sub], busqueda);
          lista = obtenerProductosFiltradosYOrdenados(lista);
          if (!lista.length) continue;

          hayAlgo = true;
          const h3 = document.createElement("h3");
          h3.textContent = `${capitalizarTitulo(cat)} > ${capitalizarTitulo(sub)}`;
          contenedor.appendChild(h3);

          const grid = document.createElement("div");
          grid.className = "productos-grid";
          lista.forEach(p => grid.appendChild(crearCard(p)));
          contenedor.appendChild(grid);
        }
      }

      if (!hayAlgo) {
        const p = document.createElement("p");
        p.textContent = "No se encontraron productos para este filtro.";
        contenedor.appendChild(p);
      }
    }

    /* ---------- marcar botón activo en sidebar ---------- */
    function marcarFiltroActivo(clave) {
      document.querySelectorAll(".btn-filtro-especial").forEach(btn => {
        btn.classList.toggle("activo", btn.dataset.clave === clave);
      });
    }

    /* ---------- crear tarjeta ---------- */
    function crearCard(p) {
      const card = document.createElement("div");
      card.className = "producto";
      card.dataset.codigo = p.CODIGO;
      if (parseInt(p.STOCK) === 0) card.classList.add("sin-stock");

      const precioMayorista = parseFloat(p.P.LISTA3 || 0);
      const mensaje = `Hola, quiero consultar por el producto: ${capitalizarTitulo(p.DETALLE)}\n${TIENDA_BASE}?producto=${p.CODIGO}`;
      const linkWp = `https://wa.me/${WP_NUMBER}?text=` + encodeURIComponent(mensaje);

      let insigniaArriba = "";
      let insigniaAbajo = "";
      if (parseInt(p.STOCK) > 0) {
        const insignias = [];
        if (p.MARCA === "NUEVO") insignias.push(`<div class="insignia-texto nuevo">🆕 Nuevo</div>`);
        if (insignias.length) insigniaAbajo = `<div class="insignias-abajo">${insignias.join("")}</div>`;
      }

      card.innerHTML = `
        <a href="#" class="link-producto" onclick="event.preventDefault(); navegarProducto('${p.CODIGO}')">
          ${insigniaArriba}
          <img src="${IMG_BASE}${p.CODIGO}.webp"
            alt="${capitalizarTitulo(p.DETALLE)}"
            data-codigo="${p.CODIGO}"
            data-intento="0"
            onerror="cargarImagenAlternativa(this)">
          ${insigniaAbajo}
          <h4 class="titulo-producto">${capitalizarTitulo(p.DETALLE)}</h4>
        </a>
        <p class="stock">
          <span class="stock-left">${parseInt(p.STOCK) > 0 ? "✅ En stock" : "❌ Agotado"}</span>
          <span class="precio">$${precioMayorista.toLocaleString('es-AR')} <span class="precio-mayorista-label">MAY</span></span>
        </p>
        <a class="boton-comprar" href="${linkWp}" target="_blank">
          Consultar <i class="fab fa-whatsapp"></i>
        </a>
      `;

      return card;
    }

    /* ---------- mostrar detalle de producto ---------- */
    function mostrarProducto(codigo) {
      const producto = Object.values(categorias)
        .flatMap(subs => Object.values(subs).flat())
        .find(p => p.CODIGO === codigo);
      if (!producto) return;

      const precioMayorista = parseFloat(producto.P.LISTA3 || 0);
      const mensaje2 = `Hola, quiero consultar por el producto: ${capitalizarTitulo(producto.DETALLE)}\n${TIENDA_BASE}?producto=${producto.CODIGO}`;
      const linkWp2 = `https://wa.me/${WP_NUMBER}?text=` + encodeURIComponent(mensaje2);

      contenedor.innerHTML = "";
      const div = document.createElement("div");
      div.className = "producto-detalle";
      if (parseInt(producto.STOCK) === 0) div.classList.add("sin-stock");

      div.innerHTML = `
        <h2>${capitalizarTitulo(producto.DETALLE)}</h2>
        <img src="${IMG_BASE}${producto.CODIGO}.webp"
          alt="${capitalizarTitulo(producto.DETALLE)}"
          data-codigo="${producto.CODIGO}"
          data-intento="0"
          onerror="cargarImagenAlternativa(this)">
        <div class="precio-detalle">
          <p class="precio">
            Precio Mayorista: $${precioMayorista.toLocaleString("es-AR")}
            <span class="precio-mayorista-label">MAY</span>
          </p>
        </div>
        <div class="stock-e-insignias">
          <span class="stock-texto">${parseInt(producto.STOCK) > 0 ? "✅ En stock" : "❌ Agotado"}</span>
          ${producto.MARCA === "NUEVO" ? `<div class="insignia-detalle nuevo">🆕 Nuevo</div>` : ""}
        </div>
        <a class="boton-comprar2" href="${linkWp2}" target="_blank">
          Toca aquí para Consultar <i class="fab fa-whatsapp"></i>
        </a>
        <div class="boton-accion">
          <button class="boton-atras" onclick="volverProducto()">
            <i class="fa-solid fa-caret-left"></i>Volver
          </button>
          <button class="boton-compartir" onclick="compartirProducto('${producto.DETALLE}','${producto.CODIGO}')">
            Compartir<i class="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      `;

      contenedor.appendChild(div);
    }

    /* ---------- compartir ---------- */
    window.compartirProducto = function (detalle, codigo) {
      const url = `${TIENDA_BASE}?producto=${codigo}`;
      const titulo = capitalizarTitulo(detalle);
      if (navigator.share) {
        navigator.share({ title: titulo, text: `Producto NovaCenter: ${titulo}`, url })
          .catch(err => console.error("Error al compartir:", err));
      } else {
        navigator.clipboard.writeText(url)
          .then(() => alert(`URL copiada: ${url}`))
          .catch(err => console.error("Error al copiar:", err));
      }
    };

    /* ---------- construir sidebar: botones filtros especiales ---------- */
    Object.entries(filtrosEspeciales).forEach(([clave, config]) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "btn-filtro-especial";
      btn.dataset.clave = clave;
      btn.textContent = `👤 ${config.label}`;
      btn.addEventListener("click", () => {
        filtroActivoKey = clave;
        if (inputBuscar) inputBuscar.value = "";
        if (filtros) filtros.classList.remove("visible");
        history.pushState({}, "", `?filtro=${encodeURIComponent(clave)}`);
        renderizarFiltroEspecial(clave);
        if (window.innerWidth <= 600) {
          document.getElementById("sidebar").classList.add("oculto");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
      li.appendChild(btn);
      menuFiltros.appendChild(li);
    });

    /* ---------- construir sidebar: categorías ----------
    for (const cat in categorias) {
      const li = document.createElement("li");
      const header = document.createElement("div");
      header.className = "menu-completo";

      const aCat = document.createElement("a");
      aCat.className = "menu-categoria";
      aCat.textContent = capitalizarTitulo(cat);
      aCat.href = "#";
      aCat.addEventListener("click", e => {
        e.preventDefault();
        filtroActivoKey = null;
        if (filtros) filtros.classList.remove("visible");
        if (inputBuscar) inputBuscar.value = "";
        history.pushState({}, "", `?cat=${encodeURIComponent(cat)}`);
        mostrarCategoria(cat);
        if (window.innerWidth <= 600) {
          document.getElementById("sidebar").classList.add("oculto");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });

      const toggle = document.createElement("button");
      toggle.className = "botonflecha";
      toggle.textContent = "⬇️";
      toggle.style.cssText = "background:none;border:none;color:white;cursor:pointer";
      toggle.addEventListener("click", e => {
        e.stopPropagation();
        li.classList.toggle("active");
        toggle.textContent = li.classList.contains("active") ? "⬆️" : "⬇️";
      });

      header.appendChild(aCat);
      header.appendChild(toggle);
      li.appendChild(header);

      const subUl = document.createElement("ul");
      subUl.className = "submenu";

      for (const sub in categorias[cat]) {
        const subLi = document.createElement("li");
        const subA = document.createElement("a");
        subA.className = "menu-subcategoria";
        subA.textContent = capitalizarTitulo(sub);
        subA.href = "#";
        subA.addEventListener("click", e => {
          e.preventDefault();
          filtroActivoKey = null;
          if (filtros) filtros.classList.remove("visible");
          if (inputBuscar) inputBuscar.value = "";
          history.pushState({}, "", `?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}`);
          mostrarSubcategoria(cat, sub);
          if (window.innerWidth <= 600) {
            document.getElementById("sidebar").classList.add("oculto");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
        subLi.appendChild(subA);
        subUl.appendChild(subLi);
      }

      li.appendChild(subUl);
      menu.appendChild(li);
    } */

    /* ---------- mostrar categoría ---------- */
    function mostrarCategoria(cat) {
      contenedor.innerHTML = `<h2>${capitalizarTitulo(cat)}</h2>`;
      marcarFiltroActivo(null);
      for (const sub in categorias[cat]) {
        let lista = aplicarFiltroMayorista(categorias[cat][sub]);
        lista = obtenerProductosFiltradosYOrdenados(lista);
        if (!lista.length) continue;
        const h3 = document.createElement("h3");
        h3.textContent = capitalizarTitulo(sub);
        contenedor.appendChild(h3);
        const grid = document.createElement("div");
        grid.className = "productos-grid";
        lista.forEach(p => grid.appendChild(crearCard(p)));
        contenedor.appendChild(grid);
      }
    }

    /* ---------- mostrar subcategoría ---------- */
    function mostrarSubcategoria(cat, sub) {
      contenedor.innerHTML = `<h2>${capitalizarTitulo(cat)} > ${capitalizarTitulo(sub)}</h2>`;
      marcarFiltroActivo(null);
      let lista = aplicarFiltroMayorista(categorias[cat][sub]);
      lista = obtenerProductosFiltradosYOrdenados(lista);
      const grid = document.createElement("div");
      grid.className = "productos-grid";
      lista.forEach(p => grid.appendChild(crearCard(p)));
      contenedor.appendChild(grid);
    }

    /* ---------- botón Ver Todos ---------- */
    verTodosBtn.addEventListener("click", () => {
      filtroActivoKey = null;
      if (filtros) filtros.classList.remove("visible");
      if (inputBuscar) inputBuscar.value = "";
      history.pushState({}, "", location.pathname);
      renderizarTodos();
      if (window.innerWidth <= 600) {
        document.getElementById("sidebar").classList.add("oculto");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* ---------- búsqueda en tiempo real ---------- */
    if (inputBuscar) {
      inputBuscar.addEventListener("input", e => {
        const termino = e.target.value.trim();
        if (termino.length === 1) return;
        if (filtroActivoKey) {
          renderizarFiltroEspecial(filtroActivoKey, termino);
        } else {
          renderizarTodos(termino);
        }
      });
    }

    /* ---------- filtro stock y orden ---------- */
    if (filtroStock) filtroStock.addEventListener("change", manejarNavegacionURL);
    if (ordenarSelect) ordenarSelect.addEventListener("change", manejarNavegacionURL);

    /* ---------- navegación por URL ---------- */
    function manejarNavegacionURL() {
      if (filtros) filtros.classList.remove("visible");
      if (inputBuscar) inputBuscar.value = "";

      const params = new URLSearchParams(location.search);
      const filtroParam  = params.get("filtro");
      const cat          = params.get("cat");
      const sub          = params.get("sub");
      const productoParam = params.get("producto");

      if (filtroParam && filtrosEspeciales[filtroParam]) {
        filtroActivoKey = filtroParam;
        renderizarFiltroEspecial(filtroParam);
      } else if (productoParam) {
        mostrarProducto(productoParam);
      } else if (cat && sub && categorias[cat]?.[sub]) {
        filtroActivoKey = null;
        mostrarSubcategoria(cat, sub);
      } else if (cat && categorias[cat]) {
        filtroActivoKey = null;
        mostrarCategoria(cat);
      } else {
        filtroActivoKey = null;
        renderizarTodos();
      }
    }

    window.addEventListener("popstate", manejarNavegacionURL);
    manejarNavegacionURL();

    /* ---------- navegación a producto ---------- */
    function navegarProducto(codigo) {
      if (filtros) filtros.classList.remove("visible");
      sessionStorage.setItem("scrollPos", window.scrollY);
      history.pushState({ producto: codigo }, "", `?producto=${encodeURIComponent(codigo)}`);
      mostrarProducto(codigo);
    }
    window.navegarProducto = navegarProducto;

    window.volverProducto = function () {
      if (inputBuscar) inputBuscar.value = "";
      if (window.history.length > 1) {
        history.back();
      } else {
        history.replaceState({}, "", location.pathname);
        renderizarTodos();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    /* ---------- restaurar scroll ---------- */
    const posGuardada = sessionStorage.getItem("scrollPos");
    if (posGuardada) {
      window.scrollTo(0, parseInt(posGuardada));
      sessionStorage.removeItem("scrollPos");
    }

    /* ---------- sidebar móvil ---------- */
    if (window.innerWidth <= 600) {
      document.getElementById("sidebar").classList.add("oculto");
    }
    function controlarSidebar() {
      const sidebar = document.getElementById("sidebar");
      const topbarMovil = document.getElementById("topbar-movil");
      if (window.getComputedStyle(topbarMovil).display === "none") {
        sidebar.classList.remove("oculto");
      }
    }
    window.addEventListener("resize", controlarSidebar);
    window.addEventListener("load", controlarSidebar);

    document.getElementById("toggle-menu")
      .addEventListener("click", () =>
        document.getElementById("sidebar").classList.toggle("oculto"));

    /* ---------- toggle filtros móvil ---------- */
    if (toggleFiltros && filtros) {
      toggleFiltros.addEventListener("click", () => {
        filtros.classList.toggle("visible");
        filtros.classList.toggle("oculto");
      });
    }

    let startY = null, dragging = false;
    document.addEventListener("touchstart", e => {
      if (window.scrollY === 0) { startY = e.touches[0].clientY; dragging = true; }
    });
    document.addEventListener("touchmove", e => {
      if (!dragging || startY === null) return;
      if (e.touches[0].clientY - startY > 60) {
        filtros.classList.add("visible");
        filtros.classList.remove("oculto");
        dragging = false;
      }
    });
    document.addEventListener("touchend", () => { startY = null; dragging = false; });

    window.addEventListener("scroll", () => {
      if (filtros.classList.contains("visible")) filtros.classList.remove("visible");
    });

  });

/* ---------- fallback de imágenes ---------- */
function cargarImagenAlternativa(img) {
  const cod = img.dataset.codigo;
  let intento = parseInt(img.dataset.intento || "0");
  const extensiones = ['webp', 'jpg', 'png', 'placeholder.webp'];
  intento++;
  if (intento >= extensiones.length) return;
  img.dataset.intento = intento;
  img.onerror = () => cargarImagenAlternativa(img);
  const ext = extensiones[intento];
  img.src = ext === 'placeholder.webp'
    ? '../tienda/img/placeholder.webp'
    : `../tienda/img/${cod}.${ext}`;
}

/* -------   fin script.js mayorista   -------- */
