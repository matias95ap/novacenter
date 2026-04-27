/* -------   script.js (modificado con pushState)   -------- */

Promise.all([
  fetch("productos.json").then(res => res.json()),
  fetch("excluidos.json").then(res => res.json())
])
  .then(([data, codigosExcluidos]) => {
    // Filtrar productos excluidos por CODIGO
    data = data.filter(p => !codigosExcluidos.includes(p.CODIGO));
    const productosNuevos = data.filter(p => p.MARCA === "NUEVO");
    const menu = document.getElementById("menu-categorias");
    const contenedor = document.getElementById("contenedor-productos");
    const verTodosBtn = document.getElementById("ver-todos");
    const inputBuscar = document.getElementById("input-buscar");
    const ordenarSelect = document.getElementById("ordenar-select");
    const filtroStock = document.getElementById("filtro-stock");
    const filtros = document.getElementById("busqueda-filtros");
    const toggleFiltros = document.getElementById("toggle-filtros");

    const subcategoriasExcluidasMayorista = [
      "CELULAR Y COMPUTACION > MODULOS DISPLAY"
      // podés agregar más
    ];

    const filtrosEspeciales = {
      "@rafacel": {
        incluir: ["CELULAR Y COMPUTACION > MODULOS DISPLAY",
          "CELULAR Y COMPUTACION > BATERIAS", "CELULAR Y COMPUTACION > REPUESTOS CEL"
        ]
      },
      "@turcoh": {
        incluir: ["CELULAR Y COMPUTACION > MODULOS DISPLAY",
          "CELULAR Y COMPUTACION > BATERIAS", "CELULAR Y COMPUTACION > REPUESTOS CEL"
        ]
      },
      "@celsop": {},
      "@repuesto": {},
      "@kioscogri": {
        excluir: ["CELULAR Y COMPUTACION > MODULOS DISPLAY",
          "CELULAR Y COMPUTACION > BATERIAS", "CELULAR Y COMPUTACION > REPUESTOS CEL"]
      },
      "@gri17": {
        excluir: ["CELULAR Y COMPUTACION > MODULOS DISPLAY",
          "CELULAR Y COMPUTACION > BATERIAS", "CELULAR Y COMPUTACION > REPUESTOS CEL"]
      },
      "@borala": {
        excluir: ["CELULAR Y COMPUTACION > MODULOS DISPLAY",
          "CELULAR Y COMPUTACION > BATERIAS", "CELULAR Y COMPUTACION > REPUESTOS CEL"]
      }
    };


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
      const mayusculas = ["hdmi", "vga", "rca", "gb", "rgb", "led", "otg", "ps2", "pc", "sata", "sd", "usb", "ok"];

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

    /* ----función de liquidación----*/
    function esProductoLiquidacion(p) {
      const lista2 = parseFloat(p.P.LISTA2);
      const venta = parseFloat(p.P.VENTA);
      return lista2 > venta;
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
      const terminoLimpio = termino.toLowerCase().trim();

      const esMayorista = terminoLimpio.includes("@mayorista");
      const claveEspecial = Object.keys(filtrosEspeciales).find(k => terminoLimpio.includes(k));
      const filtroConfig = claveEspecial ? filtrosEspeciales[claveEspecial] : null;
      const subcategoriasIncluir = filtroConfig?.incluir || null;
      const subcategoriasExcluir = filtroConfig?.excluir || null;
      const aplicaFiltroMayorista = esMayorista || claveEspecial; // ambos aplican reglas de mayorista

      const terminoBusqueda = terminoLimpio
        .replace("@mayorista", "")
        .replace(claveEspecial || "", "")
        .trim();

      const resultados = Object.values(categorias)
        .flatMap(subs => Object.entries(subs).flatMap(([sub, productos]) =>
          productos.map(p => ({ ...p, SUB: sub }))
        ))
        .filter(p => {
          const detalle = p.DETALLE.toLowerCase();
          const codigo = p.CODIGO.toLowerCase();
          const coincideTexto = detalle.includes(terminoBusqueda) || codigo.includes(terminoBusqueda);
          const familia = `${p.FAMILIA}`;

          if (!coincideTexto) return false;

          if (aplicaFiltroMayorista) {
            const pmayor = parseFloat(p.P.MAYOR || 0);
            const pcosto = parseFloat(p.P.COSTO || 0);
            if (pmayor <= 0 || pmayor <= pcosto) return false;
          }

          if (esMayorista && subcategoriasExcluidasMayorista.includes(familia)) return false;

          if (subcategoriasIncluir && !subcategoriasIncluir.includes(familia)) return false;
          if (subcategoriasExcluir && subcategoriasExcluir.includes(familia)) return false;

          return true;
        });

      mostrarResultadoBusqueda(resultados, aplicaFiltroMayorista);
    }


    /* ---------- mostrar resultados de búsqueda ---------- */
    function mostrarResultadoBusqueda(productos, mayorista = false) {
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
            grid.appendChild(crearCard(p, mayorista));
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
            const modo = p.MARCA === "NUEVO"
              ? "nuevo"
              : esProductoLiquidacion(p) ? "liquidacion" : "normal";
            grid.appendChild(crearCard(p, false, modo));
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
          const modo = p.MARCA === "NUEVO"
            ? "nuevo"
            : esProductoLiquidacion(p) ? "liquidacion" : "normal";
          grid.appendChild(crearCard(p, false, modo));
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
        const modo = p.MARCA === "NUEVO"
          ? "nuevo"
          : esProductoLiquidacion(p) ? "liquidacion" : "normal";
        grid.appendChild(crearCard(p, false, modo));
      });
    }

    /* ---------- mostrar detalle de producto ---------- */

    function mostrarProducto(codigo, mayorista = false, modo = "normal", diaDelNino = false) {
      const producto = Object.values(categorias)
        .flatMap(subs => Object.values(subs).flat())
        .find(p => p.CODIGO === codigo);

      if (!producto) return;

      if (modo === "normal") {
        if (producto.MARCA === "NUEVO") modo = "nuevo";
        else if (esProductoLiquidacion(producto)) modo = "liquidacion";
      }

      const esNuevo = (modo === "nuevo" || producto.MARCA === "NUEVO") && parseInt(producto.STOCK) > 0;
      const esLiquidacion = (modo === "liquidacion" || esProductoLiquidacion(producto)) && parseInt(producto.STOCK) > 0;
      const esDiaDelNino = producto["STOCK IDEAL"] === "30" && parseInt(producto.STOCK) > 0;

      const precioVenta = parseFloat(producto.P.VENTA);
      const precioLista2 = parseFloat(producto.P.LISTA2);
      const precioFinal = esLiquidacion ? precioVenta : precioVenta;
      const descuento = esLiquidacion
        ? Math.round(((precioLista2 - precioVenta) / precioLista2) * 100)
        : 0;

      contenedor.innerHTML = "";
      const div = document.createElement("div");
      div.className = "producto-detalle";
      if (parseInt(producto.STOCK) === 0) div.classList.add("sin-stock");

      const imagen = producto.CODIGO && producto.CODIGO.trim()
        ? `img/${producto.CODIGO}.webp`
        : "img/placeholder.webp";

      const mensaje2 = `Hola, quiero consultar por el producto: ${capitalizarTitulo(producto.DETALLE)}\nhttps://novacenter.ar/tienda/?producto=${producto.CODIGO}`;
      const linkWp2 = "https://wa.me/5493772582822?text=" + encodeURIComponent(mensaje2);

      let precioHTML = `
        <p class="precio">Precio: $${precioFinal.toLocaleString("es-AR")}</p>
      `;

      let extraHTML = "";

      if (esLiquidacion) {
        precioHTML = `
          <span> Antes:</span>
          <span class="precio"><s>$${precioLista2.toLocaleString("es-AR")}</s></span>
        `;
        extraHTML = `
          <div class="liquidacion-precio-detalle">
            <span class="precio-final">Ahora: $${precioVenta.toLocaleString("es-AR")}</span>
            <span class="descuento">--->💸 ${descuento}% OFF</span>
          </div>
        `;
      }
      div.innerHTML = `
        <h2>${capitalizarTitulo(producto.DETALLE)}</h2>
        <img src="img/${producto.CODIGO}.webp" alt="${capitalizarTitulo(producto.DETALLE)}" data-codigo="${producto.CODIGO}" data-intento="0" onerror="cargarImagenAlternativa(this)">
        <div class="precio-detalle">
          ${precioHTML}
          ${extraHTML}
        </div>
        <div class="stock-e-insignias">
         <span class="stock-texto">${parseInt(producto.STOCK) > 0 ? "✅ En stock" : "❌ Agotado"}</span>
         ${esDiaDelNino ? `<div class="insignia-detalle especial">🎁 Día del Niño</div>` : ""}
         ${esLiquidacion ? `<div class="insignia-detalle liquidacion">💸 Liquidación</div>` : ""}
         ${esNuevo ? `<div class="insignia-detalle nuevo">🆕 Nuevo</div>` : ""}
        </div>
        <a class="boton-comprar2" href="${linkWp2}" target="_blank">
          Toca aqui para Consultar <i class="fab fa-whatsapp"></i>
        </a>
        <div class="boton-accion">
          <button class="boton-atras" onclick="volverProducto()"><i class="fa-solid fa-caret-left"></i>Volver</button>
          <button class="boton-compartir" onclick="compartirProducto('${producto.DETALLE}','${producto.CODIGO}')">Compartir<i class="fa-solid fa-share-nodes"></i></button>
        </div>
      `;

      contenedor.appendChild(div);
    }

    /* ---------- tarjeta de producto ---------- */
    function crearCard(p, mayorista = false) {
      const esNuevo = p.MARCA === "NUEVO";
      const esLiquidacion = esProductoLiquidacion(p);
      const card = document.createElement("div");
      card.className = "producto";
      card.dataset.codigo = p.CODIGO;

      if (parseInt(p.STOCK) === 0) card.classList.add("sin-stock");

      const imagen = p.CODIGO && p.CODIGO.trim()
        ? `img/${p.CODIGO}.webp`
        : "img/placeholder.webp";

      const precioVenta = parseFloat(p.P.VENTA);
      const precioMayorista = parseFloat(p.P.MAYOR || 0);
      const precioMostrar = mayorista ? precioMayorista : precioVenta;

      const mensaje = `Hola, quiero consultar por el producto: ${capitalizarTitulo(p.DETALLE)}\nhttps://novacenter.ar/tienda/?producto=${p.CODIGO}`;
      const linkWp = "https://wa.me/5493772582822?text=" + encodeURIComponent(mensaje);
      let insignia = "";

      let insigniaArriba = "";
      let insigniaAbajo = "";

      if (parseInt(p.STOCK) > 0) {
        // Insignia arriba de la imagen
        if (p["STOCK IDEAL"] === "30") {
          insigniaArriba = `
      <div class="insignias-arriba">
        <div class="insignia-texto especial">🎁 Novedades</div>
      </div>`;
        }

        // Insignias debajo de la imagen
        const insignias = [];
        if (esNuevo) {
          insignias.push(`<div class="insignia-texto nuevo">🆕 Nuevo</div>`);
        }


        if (insignias.length > 0) {
          insigniaAbajo = `
      <div class="insignias-abajo">
        ${insignias.join("")}
      </div>`;
        }
      }

      let precioHTML = `
        <span class="precio">$${precioMostrar.toLocaleString('es-AR')}</span>
      `;

      let extraHTML = "";

      if (esLiquidacion && parseInt(p.STOCK) > 0) {
        const precioLista2 = parseFloat(p.P.LISTA2);
        const descuento = Math.round(((precioLista2 - precioVenta) / precioLista2) * 100);

        precioHTML = `
          <span class="precio"><s>$${precioLista2.toLocaleString('es-AR')}</s></span>
        `;
        extraHTML = `
          <div class="liquidacion-precio">
            <span class="descuento">💸 ${descuento}% OFF</span>
            <span class="precio-final">$${precioVenta.toLocaleString('es-AR')}</span>
          </div>
        `;
      }

      card.innerHTML = `
        <a href="#" class="link-producto" onclick="event.preventDefault(); navegarProducto('${p.CODIGO}')">
          ${insigniaArriba}
          <img src="img/${p.CODIGO}.webp"
            alt="${capitalizarTitulo(p.DETALLE)}"
            data-codigo="${p.CODIGO}"
            data-intento="0"
            onerror="cargarImagenAlternativa(this)">
          ${insigniaAbajo}
          <h4 class="titulo-producto">${capitalizarTitulo(p.DETALLE)}</h4>
        </a>
        <p class="stock">
          <span class="stock-left">${parseInt(p.STOCK) > 0 ? "✅ En stock" : "❌ Agotado"}</span>
          ${precioHTML}
        </p>
        ${extraHTML}
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

    /* ---------- botón “Nuevos Ingresos” ---------- */
    const verNuevosBtn = document.getElementById("ver-nuevos");
    verNuevosBtn.addEventListener("click", () => {
      history.pushState({}, "", "?nuevos=1");
      mostrarNuevos();
      if (window.innerWidth <= 600) {
        document.getElementById("sidebar").classList.add("oculto");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    function mostrarNuevos() {
      contenedor.innerHTML = "<h2>🆕 Nuevos Ingresos</h2>";
      const productosParaMostrar = obtenerProductosFiltradosYOrdenados(
        productosNuevos.filter(p => parseInt(p.STOCK) > 0)
      );
      const grid = document.createElement("div");
      grid.className = "productos-grid";
      contenedor.appendChild(grid);
      productosParaMostrar.forEach(p => {
        grid.appendChild(crearCard(p, false, true)); // nuevo = true
      });
    }
    /* ---------- botón “Liquidación” ---------- */
    const verLiquidacionBtn = document.getElementById("ver-liquidacion");
    verLiquidacionBtn.addEventListener("click", () => {
      history.pushState({}, "", "?liquidacion=1");
      mostrarLiquidacion();
      if (window.innerWidth <= 600) {
        document.getElementById("sidebar").classList.add("oculto");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    function mostrarLiquidacion() {
      contenedor.innerHTML = "<h2>💸 Liquidación</h2>";
      const productosLiquidacion = data.filter(p =>
        parseInt(p.STOCK) > 0 && esProductoLiquidacion(p)
      );
      const productosParaMostrar = obtenerProductosFiltradosYOrdenados(productosLiquidacion);
      const grid = document.createElement("div");
      grid.className = "productos-grid";
      contenedor.appendChild(grid);

      productosParaMostrar.forEach(p => {
        grid.appendChild(crearCard(p, false, "liquidacion"));
      });
    }
    /* ---------- botón “Día del Niño” ---------- */
    const verDiaNinoBtn = document.getElementById("ver-dia-nino");
    verDiaNinoBtn.addEventListener("click", () => {
      history.pushState({}, "", "?dianino=1");
      mostrarDiaDelNino();
      if (window.innerWidth <= 600) {
        document.getElementById("sidebar").classList.add("oculto");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    function mostrarDiaDelNino() {
      contenedor.innerHTML = "<h2>🎁 Novedades para Regalar</h2>";
      const productosDiaNino = data.filter(p =>
        p["STOCK IDEAL"] === "30" && parseInt(p.STOCK) > 0
      );
      const productosParaMostrar = obtenerProductosFiltradosYOrdenados(productosDiaNino);
      const grid = document.createElement("div");
      grid.className = "productos-grid";
      contenedor.appendChild(grid);
      productosParaMostrar.forEach(p => {
        grid.appendChild(crearCard(p));
      });
    }
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
    let urlAntesDeBusqueda = null;

    if (inputBuscar) {
      inputBuscar.addEventListener("input", e => {
        const termino = e.target.value.toLowerCase().trim();

        const contieneClave = termino.includes("@mayorista") ||
          Object.keys(filtrosEspeciales).some(k => termino.includes(k));

        const esBusquedaValida = (termino.length >= 2 || contieneClave);

        // ⚠️ Nueva línea: no hacer nada con 1 solo carácter sin clave
        if (termino.length === 1 && !contieneClave) return;

        if (esBusquedaValida) {
          if (!location.search.startsWith("?buscar=")) {
            urlAntesDeBusqueda = location.href;
          }
          history.replaceState({ buscar: termino }, "", `?buscar=${encodeURIComponent(termino)}`);
          buscarProductos(termino);
        } else {
          if (location.search.startsWith("?buscar=")) {
            if (urlAntesDeBusqueda) {
              history.pushState({}, "", urlAntesDeBusqueda);
              manejarNavegacionURL();
              urlAntesDeBusqueda = null;
            } else {
              history.replaceState({}, "", location.pathname);
              renderizarTodos();
            }
          } else {
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
      if (filtros) filtros.classList.remove("visible");
      if (inputBuscar) inputBuscar.value = "";

      const params = new URLSearchParams(location.search);
      const cat = params.get("cat");
      const sub = params.get("sub");
      const producto = params.get("producto");
      const q = params.get("buscar");
      const verNuevos = params.get("nuevos");
      const verDiaNino = params.get("dianino");
      const verLiquidacion = params.get("liquidacion");

      if (verNuevos === "1") {
        mostrarNuevos(); // 👈 esta función la definiste antes
      } else if (q) {
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
      } if (verDiaNino === "1") {
        mostrarDiaDelNino();
      } else if (verLiquidacion === "1") {
        mostrarLiquidacion();
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
function cargarImagenAlternativa(img) {
  const cod = img.dataset.codigo;
  let intento = parseInt(img.dataset.intento || "0");
  const extensiones = ['webp', 'jpg', 'png', 'placeholder.webp'];

  intento++;
  if (intento >= extensiones.length) return;

  img.dataset.intento = intento;
  img.onerror = () => cargarImagenAlternativa(img); // Reasigna el error handler
  const ext = extensiones[intento];
  img.src = ext === 'placeholder.webp' ? 'img/placeholder.webp' : `img/${cod}.${ext}`;

}


/* -------   fin script.js modificado   -------- */

