fetch("productos.json")
  .then(res => res.json())
  .then(data => {
    const menu = document.getElementById("menu-categorias");
    const contenedor = document.getElementById("contenedor-productos");
    const verTodosBtn = document.getElementById("ver-todos");

    const categorias = {};
    data.forEach(p => {
      const [cat, sub = "VARIOS"] = p.categoria.split(" > ");
      if (!categorias[cat]) categorias[cat] = {};
      if (!categorias[cat][sub]) categorias[cat][sub] = [];
      categorias[cat][sub].push(p);
    });

    function capitalizarTitulo(str) {
      const minusculas = ["y", "o","de", "para","en","con"];
      const mayusculas = ["hdmi","vga","rca","gb","rgb","led","otg","ps2","pc","sata","sd", "usb"];
    
      return str
        .toLowerCase()
        .split(" ")
        .map(palabra => {
          if (mayusculas.includes(palabra)) return palabra.toUpperCase();
          if (minusculas.includes(palabra)) return palabra;
          return palabra.charAt(0).toUpperCase() + palabra.slice(1);
        })
        .join(" ");
    }
    

    for (const cat in categorias) {
      const li = document.createElement("li");

      // Contenedor de categoría con íconos y acción
      const categoriaHeader = document.createElement("div");
      categoriaHeader.className = "menu-completo";

      const aCat = document.createElement("a");
      aCat.className = "menu-categoria";
      aCat.textContent = capitalizarTitulo(cat);
      aCat.href = "#";
      aCat.addEventListener("click", e => {
        e.preventDefault();
        mostrarCategoria(cat);
        // ✅ Cierra el menú en móviles
        if (window.innerWidth <= 600) {
        document.getElementById("sidebar").classList.add("oculto");
        window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ vuelve ▶ arriba
        }
      });

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = "⬇️"; // flecha derecha
      toggleBtn.style.background = "none";
      toggleBtn.style.border = "none";
      toggleBtn.style.color = "white";
      toggleBtn.style.cursor = "pointer";
      toggleBtn.addEventListener("click", e => {
        e.stopPropagation();
        li.classList.toggle("active");
        toggleBtn.textContent = li.classList.contains("active") ? "⬆️" : "⬇️";
      })
      toggleBtn.className = "botonflecha";

      categoriaHeader.appendChild(aCat);
      categoriaHeader.appendChild(toggleBtn);
      li.appendChild(categoriaHeader);

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
          mostrarProductos(cat, sub);

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

    verTodosBtn.addEventListener("click", () => {
      renderizarTodos();
      if (window.innerWidth <= 600) {
        document.getElementById("sidebar").classList.add("oculto");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    
    renderizarTodos(); // 👈 este se debería ejecutar al cargar

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
      h2.textContent = cat + " > " + sub;
      contenedor.appendChild(h2);

      const grid = document.createElement("div");
      grid.className = "productos-grid";
      categorias[cat][sub].forEach(p => grid.appendChild(crearCard(p)));
      contenedor.appendChild(grid);
    }
    
    function crearCard(p) {
      const card = document.createElement("div");
      card.className = "producto";
      if (parseInt(p.stock) === 0) card.classList.add("sin-stock");

      const imagenRuta = p.imagen && p.imagen.trim() !== "" 
      ? `img/${p.imagen}.jpg` 
      : "img/placeholder.jpg";

      
      const mensaje = `Hola, quiero comprar el producto: ${capitalizarTitulo(p.nombre)}`;
      const linkWhatsapp = "https://wa.me/5493772582822?text=" + encodeURIComponent(mensaje);

      card.innerHTML = `
        <img src="${imagenRuta}" alt="${p.nombre}" onerror="this.src='img/placeholder.jpg'">
        <h4 class="titulo-producto">${capitalizarTitulo(p.nombre)}</h4>
        <p class="stock">
          <span class="stock-left">${parseInt(p.stock) > 0 ? "✅ En stock" : "❌ Sin stock"}</span>
          <span class="precio">$${parseInt(p.precio).toLocaleString("es-AR")}</span>
        </p>
        <a class="boton-comprar" href="${linkWhatsapp}" target="_blank">
          Consultar<i class="fab fa-whatsapp"></i>
        </a>
      `;
      return card;
    }

    // Botón hamburguesa para móvil
    document.getElementById("toggle-menu").addEventListener("click", () => {
      const sidebar = document.getElementById("sidebar");
      sidebar.classList.toggle("oculto");
    });
  });
