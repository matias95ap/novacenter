/* -------   script.js (modificado con pushState)   -------- */

fetch("productos.json")
  .then(res => res.json())
  .then(data => {
    const menu = document.getElementById("menu-categorias");
    const contenedor = document.getElementById("contenedor-productos");
    const verTodosBtn = document.getElementById("ver-todos");

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
      const mayusculas = ["hdmi","vga","rca","gb","rgb","led","otg","ps2","pc","sata","sd","usb"];

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
      history.pushState({ cat }, "", `?cat=${encodeURIComponent(cat)}`);
      mostrarCategoria(cat);
    }

    function navegarSubcategoria(cat, sub) {
      history.pushState({ cat, sub }, "", `?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}`);
      mostrarProductos(cat, sub);
    }

    function navegarProducto(codigo) {
      history.pushState({ producto: codigo }, "", `?producto=${encodeURIComponent(codigo)}`);
      mostrarProducto(codigo);
    }
    window.navegarProducto = navegarProducto;


    /* ---------- funciones de render ---------- */
    function renderizarTodos() {
      contenedor.innerHTML = "";
      for (const cat in categorias) {
        const h2 = document.createElement("h2");
        h2.textContent = cat;
        contenedor.appendChild(h2);

        for (const sub in categorias[cat]) {
          const h3 = document.createElement("h3");
          h3.textContent = sub;
          contenedor.appendChild(h3);

          const grid = document.createElement("div");
          grid.className = "productos-grid";
          categorias[cat][sub].forEach(p => grid.appendChild(crearCard(p)));
          contenedor.appendChild(grid);
        }
      }
    }

    function mostrarCategoria(cat) {
      contenedor.innerHTML = "";
      const h2 = document.createElement("h2");
      h2.textContent = cat;
      contenedor.appendChild(h2);

      for (const sub in categorias[cat]) {
        const h3 = document.createElement("h3");
        h3.textContent = sub;
        contenedor.appendChild(h3);

        const grid = document.createElement("div");
        grid.className = "productos-grid";
        categorias[cat][sub].forEach(p => grid.appendChild(crearCard(p)));
        contenedor.appendChild(grid);
      }
    }

    function mostrarProductos(cat, sub) {
      contenedor.innerHTML = "";
      const h2 = document.createElement("h2");
      h2.textContent = `${cat} > ${sub}`;
      contenedor.appendChild(h2);

      const grid = document.createElement("div");
      grid.className = "productos-grid";
      categorias[cat][sub].forEach(p => grid.appendChild(crearCard(p)));
      contenedor.appendChild(grid);
    }
    
    window.compartirProducto = function (detalle, codigo) {
      const url = `https://novacenter.ar/tienda/?producto=${codigo}`;
      const titulo = capitalizarTitulo(detalle);
      if (navigator.share) {
        navigator.share({
          title: titulo,
          text: `Producto de la tienda online NovaCenter: ${titulo}`,
          url: url,
        })
        .catch(err => console.error("Error al compartir:", err));
      } else {
        alert("Tu navegador no permite compartir desde aquí.");
      }
    };

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
          <button class="boton-atras" onclick="history.back()"><i class="fa-solid fa-caret-left"></i>Volver</button>
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

    /* ---------- detección de navegación con el botón atrás ---------- */
    window.addEventListener("popstate", () => {
      const params = new URLSearchParams(location.search);
      const cat = params.get("cat");
      const sub = params.get("sub");
      const producto = params.get("producto");

      if (producto) {
        mostrarProducto(producto);
      } else if (cat && sub) {
        mostrarProductos(cat, sub);
      } else if (cat) {
        mostrarCategoria(cat);
      } else {
        renderizarTodos();
      }
    });

    /* ---------- carga inicial según la URL ---------- */
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat");
    const sub = params.get("sub");
    const producto = params.get("producto");

    if (producto) {
      mostrarProducto(producto);
    } else if (cat && sub) {
      mostrarProductos(cat, sub);
    } else if (cat) {
      mostrarCategoria(cat);
    } else {
      renderizarTodos();
    }
  });

/* -------   fin script.js modificado   -------- */
