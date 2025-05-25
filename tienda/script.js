/* -------   script.js (modificado con pushState)   -------- */

Promise.all([
  fetch("productos.json").then(res => res.json()),
  fetch("excluidos.json").then(res => res.json())
])
  .then(([data, codigosExcluidos]) => {
    // Filtrar productos excluidos por CODIGO
    data = data.filter(p => !codigosExcluidos.includes(p.CODIGO));
    const menu = document.getElementById("menu-categorias");
    const contenedor = document.getElementById("contenedor-productos");
    const verTodosBtn = document.getElementById("ver-todos");
    const inputBuscar = document.getElementById("input-buscar");
    const ordenarSelect = document.getElementById("ordenar-select");
    const filtroStock = document.getElementById("filtro-stock");
    const filtros = document.getElementById("busqueda-filtros");
    const toggleFiltros = document.getElementById("toggle-filtros");

    /* ---------- agrupar categorías / subcategorías ---------- */
    const categorias = {};
    data.forEach(p => {
      const [cat, sub = "VARIOS"] = p.FAMILIA.split(" > ");
      if (!categorias[cat]) categorias[cat] = {};
      if (!categorias[cat][sub]) categorias[cat][sub] = [];
      categorias[cat][sub].push(p);
    });

    /* ---------- helper para capitalizar ---------- */
    function capitalizarTitulo(str) {
      const minusculas = ["y", "a", "o", "de", "para", "en", "con"];
      const mayusculas = ["hdmi", "vga", "rca", "gb", "rgb", "led", "otg", "ps2", "pc", "sata", "sd", "usb"];

      return str
        .toLowerCase()
        .split(" ")
        .map(pal => {
          if (mayusculas.includes(pal)) return pal.toUpperCase();
          if (minusculas.includes(pal)) return pal;
          return pal.charAt(0).toUpperCase() + pal.slice(1);
        })
        .join(" ");
    }
    /* ---------- ordenar productos por criterio ---------- */
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
          // Aquí aplicamos tu criterio: con stock primero, sin stock después, sin dividir por categoría
          const conStock = lista.filter(p => parseInt(p.STOCK) > 0);
          const sinStock = lista.filter(p => parseInt(p.STOCK) === 0);
          return [...conStock, ...sinStock];
      }
    }

    /* ---------- NUEVA FUNCIÓN: Unifica la aplicación de filtros y ordenamiento ---------- */
    function obtenerProductosFiltradosYOrdenados(productosBase) {
      let productosFinales = productosBase;

      // Aplicar filtro de stock si está activado
      if (filtroStock && filtroStock.checked) {
        productosFinales = productosFinales.filter(p => parseInt(p.STOCK) > 0);
      }

      // Aplicar ordenamiento
      const criterioOrdenamiento = ordenarSelect?.value || "";
      productosFinales = ordenarProductos(productosFinales, criterioOrdenamiento);

      return productosFinales;
    }

    /* ---------- buscar productos por término (detalle o código) ---------- */
    function buscarProductos(termino) {
      const resultados = Object.values(categorias)
        .flatMap(subs => Object.values(subs).flat())
        .filter(p => {
          const detalle = p.DETALLE.toLowerCase();
          const codigo = p.CODIGO.toLowerCase();
          return detalle.includes(termino) || codigo.includes(termino);
        });

      mostrarResultadoBusqueda(resultados);
    }

    /* ---------- mostrar resultados de búsqueda ---------- */
    function mostrarResultadoBusqueda(productos) {
      contenedor.innerHTML = "";
      if (productos.length === 0) {
        const noResult = document.createElement("p");
        noResult.textContent = "No se encontraron resultados.";
        contenedor.appendChild(noResult);
        return;
      }
    
      const criterioOrdenamiento = ordenarSelect?.value || "";
    
      // Agrupar resultados por categoría > subcategoría
      const resultadosAgrupados = {};
    
      productos.forEach(p => {
        const [cat, sub = "VARIOS"] = p.FAMILIA.split(" > ");
        if (!resultadosAgrupados[cat]) resultadosAgrupados[cat] = {};
        if (!resultadosAgrupados[cat][sub]) resultadosAgrupados[cat][sub] = [];
        resultadosAgrupados[cat][sub].push(p);
      });
    
      for (const cat in resultadosAgrupados) {
        const h2 = document.createElement("h2");
        h2.textContent = capitalizarTitulo(cat);
        contenedor.appendChild(h2);
    
        for (const sub in resultadosAgrupados[cat]) {
          let lista = resultadosAgrupados[cat][sub];
    
          // Filtro de stock activo
          if (filtroStock && filtroStock.checked) {
            lista = lista.filter(p => parseInt(p.STOCK) > 0);
          }
    
          // Ordenamiento (por criterio o stock por defecto)
          if (!criterioOrdenamiento || criterioOrdenamiento === "default") {
            const conStock = lista.filter(p => parseInt(p.STOCK) > 0);
            const sinStock = lista.filter(p => parseInt(p.STOCK) === 0);
            lista = [...conStock, ...sinStock];
          } else {
            lista = ordenarProductos(lista, criterioOrdenamiento);
          }
    
          const h3 = document.createElement("h3");
          h3.textContent = capitalizarTitulo(sub);
          contenedor.appendChild(h3);
    
          const grid = document.createElement("div");
          grid.className = "productos-grid";
          contenedor.appendChild(grid);
    
          lista.forEach(p => {
            grid.appendChild(crearCard(p));
          });
        }
      }
    }
    


    /* ---------- renderizar todos los productos agrupados por familia ---------- */
    function renderizarTodos() {
      contenedor.innerHTML = "";
      const criterioOrdenamiento = ordenarSelect?.value || "";

      for (const cat in categorias) {
        const h2 = document.createElement("h2");
        h2.textContent = capitalizarTitulo(cat);
        contenedor.appendChild(h2);

        for (const sub in categorias[cat]) {
          const productosOriginales = categorias[cat][sub];

          // Aplicar filtro de stock
          let productos = filtroStock && filtroStock.checked
            ? productosOriginales.filter(p => parseInt(p.STOCK) > 0)
            : [...productosOriginales];

          // Ordenamiento por defecto: con stock primero
          if (!criterioOrdenamiento || criterioOrdenamiento === "default") {
            const conStock = productos.filter(p => parseInt(p.STOCK) > 0);
            const sinStock = productos.filter(p => parseInt(p.STOCK) === 0);
            productos = [...conStock, ...sinStock];
          } else {
            productos = ordenarProductos(productos, criterioOrdenamiento);
          }

          const h3 = document.createElement("h3");
          h3.textContent = capitalizarTitulo(sub);
          contenedor.appendChild(h3);
          const grid = document.createElement("div");
          grid.className = "productos-grid";
          contenedor.appendChild(grid);

          productos.forEach(p => {
            grid.appendChild(crearCard(p));
          });
        }
      }

      // Restaurar scroll
      const posGuardada = sessionStorage.getItem("scrollPos");
      if (posGuardada) {
        window.scrollTo(0, parseInt(posGuardada));
        sessionStorage.removeItem("scrollPos");
      }
    }


    /* ---------- mostrar productos por categoría ---------- */
    function mostrarCategoria(cat) {
      contenedor.innerHTML = "";
      const h2 = document.createElement("h2");
      h2.textContent = capitalizarTitulo(cat);
      contenedor.appendChild(h2);

      const criterioOrdenamiento = ordenarSelect?.value || "";

      for (const sub in categorias[cat]) {
        const productosOriginales = categorias[cat][sub];

        // Aplicar filtro de stock
        let productos = filtroStock && filtroStock.checked
          ? productosOriginales.filter(p => parseInt(p.STOCK) > 0)
          : [...productosOriginales];

        // Si es ordenamiento por defecto, agrupamos por stock dentro de la subcategoría
        if (!criterioOrdenamiento || criterioOrdenamiento === "default") {
          const conStock = productos.filter(p => parseInt(p.STOCK) > 0);
          const sinStock = productos.filter(p => parseInt(p.STOCK) === 0);
          productos = [...conStock, ...sinStock];
        } else {
          productos = ordenarProductos(productos, criterioOrdenamiento);
        }

        // Crear subtítulo y grilla
        const h3 = document.createElement("h3");
        h3.textContent = capitalizarTitulo(sub);
        contenedor.appendChild(h3);
        const grid = document.createElement("div");
        grid.className = "productos-grid";
        contenedor.appendChild(grid);

        productos.forEach(p => {
          grid.appendChild(crearCard(p));
        });
      }
    }


    /* ---------- mostrar productos por subcategoría ---------- */
    function mostrarProductos(cat, sub) {
      contenedor.innerHTML = "";
      const h2 = document.createElement("h2");
      h2.textContent = `${capitalizarTitulo(cat)} > ${capitalizarTitulo(sub)}`;
      contenedor.appendChild(h2);

      const productosEnSubcategoria = categorias[cat][sub];
      const productosParaMostrar = obtenerProductosFiltradosYOrdenados(productosEnSubcategoria);

      const grid = document.createElement("div");
      grid.className = "productos-grid";
      contenedor.appendChild(grid);

      productosParaMostrar.forEach(p => {
        grid.appendChild(crearCard(p));
      });
    }

    /* ---------- mostrar detalle de producto ---------- */

    function mostrarProducto(codigo) {
      const producto = Object.values(categorias)
        .flatMap(subs => Object.values(subs).flat())
        .find(p => p.CODIGO === codigo);

      if (!producto) return;

      contenedor.innerHTML = "";

      const div = document.createElement("div");
      div.className = "producto-detalle";
      if (parseInt(producto.STOCK) === 0) div.classList.add("sin-stock");

      const imagen = producto.CODIGO && producto.CODIGO.trim()
        ? `img/${producto.CODIGO}.jpg`
        : "img/placeholder.jpg";

      const mensaje2 =
        `Hola, quiero comprar el producto: ${capitalizarTitulo(producto.DETALLE)}\n` +
        `https://novacenter.ar/tienda/?producto=${producto.CODIGO}`;
      const linkWp2 =
        "https://wa.me/5493772582822?text=" + encodeURIComponent(mensaje2);

      div.innerHTML = `
          <h2>${capitalizarTitulo(producto.DETALLE)}</h2>
          <img src="${imagen}" alt="${capitalizarTitulo(producto.DETALLE)}"
               onerror="this.src='img/placeholder.jpg'">
          <p class="precio">Precio: $${parseInt(producto.P.VENTA).toLocaleString("es-AR")}</p>
          <p>${parseInt(producto.STOCK) > 0 ? "✅ En stock" : "❌ Sin stock"}</p>
          <a class="boton-comprar2" href="${linkWp2}" target="_blank">
            Toca aqui para Consultar <i class="fab fa-whatsapp"></i>
          </a>
          <div class="boton-accion">
            <button class="boton-atras" onclick="volverProducto()"><i class="fa-solid fa-caret-left"></i>Volver</button>
            <button class="boton-compartir" onclick="compartirProducto('${producto.DETALLE}',
            '${producto.CODIGO}')">Compartir<i class="fa-solid fa-share-nodes"></i></button>
          </div>
          `;

      contenedor.appendChild(div);
    }

    /* ---------- tarjeta de producto ---------- */
    function crearCard(p) {
      const card = document.createElement("div");
      card.className = "producto";
      card.dataset.codigo = p.CODIGO;
      if (parseInt(p.STOCK) === 0) card.classList.add("sin-stock");

      const imagen = p.CODIGO && p.CODIGO.trim()
        ? `img/${p.CODIGO}.jpg`
        : "img/placeholder.jpg";

      const mensaje =
        `Hola, quiero comprar el producto: ${capitalizarTitulo(p.DETALLE)}\n` +
        `https://novacenter.ar/tienda/?producto=${p.CODIGO}`;
      const linkWp =
        "https://wa.me/5493772582822?text=" + encodeURIComponent(mensaje);

      card.innerHTML = `
        <a href="#" class="link-producto" onclick="event.preventDefault(); navegarProducto('${p.CODIGO}')">
          <img src="${imagen}" alt="${capitalizarTitulo(p.DETALLE)}"
               onerror="this.src='img/placeholder.jpg'">
          <h4 class="titulo-producto">${capitalizarTitulo(p.DETALLE)}</h4>
        </a>
        <p class="stock">
          <span class="stock-left">${parseInt(p.STOCK) > 0 ? "✅ En stock" : "❌ Sin stock"}</span>
          <span class="precio">$${parseInt(p.P.VENTA).toLocaleString('es-AR')}</span>
        </p>
        <a class="boton-comprar" href="${linkWp}" target="_blank">
          Consultar <i class="fab fa-whatsapp"></i>
        </a>
      `;
      return card;
    }
    /* ---------- compartir producto ---------- */
    window.compartirProducto = function (detalle, codigo) {
      const url = `https://novacenter.ar/tienda/?producto=${codigo}`;
      const titulo = capitalizarTitulo(detalle);
      if (navigator.share) {
        navigator.share({
          title: titulo,
          text: `Producto de la tienda online NovaCenter: ${titulo}`,
          url: url,
        })
          .catch(err => console.error("cháke, error al compartir:", err));
      } else {
        // Alternativa para navegadores que no soportan la API Web Share
        navigator.clipboard.writeText(url)
          .then(() => alert(`URL copiada al portapapeles: ${url}`))
          .catch(err => console.error("Error al copiar URL:", err));
      }
    };

    /* ---------- construir menú lateral ---------- */
    for (const cat in categorias) {
      const li = document.createElement("li");
      const header = document.createElement("div");
      header.className = "menu-completo";

      /* enlace categoría */
      const aCat = document.createElement("a");
      aCat.className = "menu-categoria";
      aCat.textContent = capitalizarTitulo(cat);
      aCat.href = "#";
      aCat.addEventListener("click", e => {
        e.preventDefault();
        navegarCategoria(cat);
        // ✅ Cierra el menú en móviles
        if (window.innerWidth <= 600) {
          document.getElementById("sidebar").classList.add("oculto");
          window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ vuelve ▶ arriba
        }
      });

      /* botón plegable */
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

      /* subcategorías */
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
          navegarSubcategoria(cat, sub);
          // ✅ Cierra el menú en móviles
          if (window.innerWidth <= 600) {
            document.getElementById("sidebar").classList.add("oculto");
            window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ vuelve arriba
          }
        });
        subLi.appendChild(subA);
        subUl.appendChild(subLi);
      }

      li.appendChild(subUl);
      menu.appendChild(li);
    }

    /* ---------- botón “Ver todos” ---------- */
    verTodosBtn.addEventListener("click", () => {
      if (filtros) filtros.classList.remove("visible");
      if (inputBuscar) inputBuscar.value = "";
      history.pushState({}, "", location.pathname);
      renderizarTodos();
      if (window.innerWidth <= 600) {
        document.getElementById("sidebar").classList.add("oculto");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    renderizarTodos();

    /* ---------- funciones de navegación ---------- */
    function navegarCategoria(cat) {
      if (filtros) filtros.classList.remove("visible");
      if (inputBuscar) inputBuscar.value = "";
      sessionStorage.setItem("scrollPos", window.scrollY); // Guardar posición actual
      history.pushState({ cat: cat }, "", `?cat=${encodeURIComponent(cat)}`);
      mostrarCategoria(cat);
    }

    function navegarSubcategoria(cat, sub) {
      if (filtros) filtros.classList.remove("visible");
      if (inputBuscar) inputBuscar.value = "";
      sessionStorage.setItem("scrollPos", window.scrollY); // Guardar posición actual
      history.pushState({ cat: cat, sub: sub }, "", `?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}`);
      mostrarProductos(cat, sub);
    }

    function navegarProducto(codigo) {
      if (filtros) filtros.classList.remove("visible");
      if (inputBuscar) inputBuscar.value = "";
      sessionStorage.setItem("scrollPos", window.scrollY); // Guardar posición actual
      history.pushState({ producto: codigo }, "", `?producto=${encodeURIComponent(codigo)}`);
      mostrarProducto(codigo);
    }
    window.navegarProducto = navegarProducto;


    /* ---------- autocomplete: buscar al tipear (con gestión de URL) ---------- */
    if (inputBuscar) {
      inputBuscar.addEventListener("input", e => {
        const termino = e.target.value.toLowerCase();
        if (termino.length >= 2) {
          // Si la URL actual NO es una URL de búsqueda, guarda la URL actual antes de la búsqueda.
          if (!location.search.startsWith("?buscar=")) {
            urlAntesDeBusqueda = location.href;
          }
          // Reemplaza la URL actual con el término de búsqueda.
          history.replaceState({ buscar: termino }, "", `?buscar=${encodeURIComponent(termino)}`);
          buscarProductos(termino);
        } else {
          // Si el término es muy corto o vacío
          if (location.search.startsWith("?buscar=")) {
            // Si estamos en una URL de búsqueda, volvemos atrás.
            history.back(); // Esto nos lleva a la URL antes de la ?buscar=
            // La función popstate (manejarNavegacionURL) manejará la renderización correcta al hacer history.back()
          } else {
            // En este caso, si ya no hay búsqueda, mostramos todos por defecto.
            renderizarTodos();
          }
        }
      });
    }

    /* ---------- filtro de stock ---------- */
    if (filtroStock) {
      filtroStock.addEventListener("change", () => {
        // Al cambiar el filtro de stock, volvemos a la función que decide qué mostrar
        manejarNavegacionURL();
      });
    }

    /* ---------- ordenar ---------- */
    if (ordenarSelect) {
      ordenarSelect.addEventListener("change", () => {
        // Al cambiar el orden, volvemos a la función que decide qué mostrar
        manejarNavegacionURL();
      });
    }


    /* ---------- Sidebar y Topbar ---------- */
    if (window.innerWidth <= 600) {
      document.getElementById("sidebar").classList.add("oculto");
    }
    function controlarSidebar() {
      const sidebar = document.getElementById("sidebar");
      const topbarMovil = document.getElementById("topbar-movil");

      // Si topbar está oculto (modo escritorio), mostrar sidebar
      const topbarVisible = window.getComputedStyle(topbarMovil).display !== "none";

      if (!topbarVisible) {
        sidebar.classList.remove("oculto");
      }
    }

    window.addEventListener("resize", controlarSidebar);
    window.addEventListener("load", controlarSidebar); // también al cargar

    /* ---------- boton Volver atras o Todos ---------- */
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

    /* ---------- botón hamburguesa ---------- */
    document.getElementById("toggle-menu")
      .addEventListener("click", () =>
        document.getElementById("sidebar").classList.toggle("oculto"));

    /* ---------- Función unificada para manejar la navegación por URL ---------- */
    function manejarNavegacionURL() {
      if (filtros) filtros.classList.remove("visible"); // ✅ Oculta panel al navegar con historial
      if (inputBuscar) inputBuscar.value = ""; // 🔹 limpia buscador al navegar por historial
      const params = new URLSearchParams(location.search);
      const cat = params.get("cat");
      const sub = params.get("sub");
      const producto = params.get("producto");
      const q = params.get("buscar"); // ¡Importante! Asegúrate de incluir también el parámetro 'q' para la búsqueda

      if (q) {
        if (inputBuscar) inputBuscar.value = q;
        buscarProductos(q.toLowerCase());
      } else if (producto) {
        mostrarProducto(producto);
      } else if (cat && sub) {
        mostrarProductos(cat, sub);
      } else if (cat) {
        mostrarCategoria(cat);
      } else {
        renderizarTodos();
      }
    }

    // Escucha el evento popstate para manejar la navegación del historial
    window.addEventListener("popstate", manejarNavegacionURL);

    // Llama a la función al cargar la página para la renderización inicial
    manejarNavegacionURL();

    // Botón de filtros

    if (toggleFiltros && filtros) {
      toggleFiltros.addEventListener("click", () => {
        filtros.classList.toggle("visible");
        filtros.classList.toggle("oculto");
      });
    }

    // Gesto de arrastre hacia abajo (pull down para mostrar filtros)
    let startY = null;
    let dragging = false;

    document.addEventListener("touchstart", e => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        dragging = true;
      }
    });

    document.addEventListener("touchmove", e => {
      if (!dragging || startY === null) return;
      const currentY = e.touches[0].clientY;
      if (currentY - startY > 60) {
        filtros.classList.add("visible");
        filtros.classList.remove("oculto");
        dragging = false;
      }
    });

    document.addEventListener("touchend", () => {
      startY = null;
      dragging = false;
    });

    let lastScroll = window.scrollY || 0;

    window.addEventListener("scroll", () => {
      const current = window.scrollY || 0;

      // Ocultar filtros si se scrollea (arriba o abajo)
      if (filtros.classList.contains("visible")) {
        filtros.classList.remove("visible");
      }

      lastScroll = current;
    });

  });

/* -------   fin script.js modificado   -------- */
