
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

    for (const cat in categorias) {
      const li = document.createElement("li");

      // Contenedor de categoría con íconos y acción
      const categoriaHeader = document.createElement("div");
      categoriaHeader.style.display = "flex";
      categoriaHeader.style.justifyContent = "space-between";
      categoriaHeader.style.alignItems = "center";

      const aCat = document.createElement("a");
      aCat.textContent = cat;
      aCat.style.flexGrow = "1";
      aCat.href = "#";
      aCat.addEventListener("click", e => {
        e.preventDefault();
        mostrarCategoria(cat);
      });

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = "▶"; // flecha derecha
      toggleBtn.style.background = "none";
      toggleBtn.style.border = "none";
      toggleBtn.style.color = "white";
      toggleBtn.style.cursor = "pointer";
      toggleBtn.addEventListener("click", e => {
        e.stopPropagation();
        li.classList.toggle("active");
        toggleBtn.textContent = li.classList.contains("active") ? "▼" : "▶";
      });

      categoriaHeader.appendChild(aCat);
      categoriaHeader.appendChild(toggleBtn);
      li.appendChild(categoriaHeader);

      const subUl = document.createElement("ul");
      subUl.className = "submenu";

      for (const sub in categorias[cat]) {
        const subLi = document.createElement("li");
        const subA = document.createElement("a");
        subA.textContent = sub;
        subA.href = "#";
        subA.addEventListener("click", e => {
          e.preventDefault();
          mostrarProductos(cat, sub);
        });
        subLi.appendChild(subA);
        subUl.appendChild(subLi);
      }

      li.appendChild(subUl);
      menu.appendChild(li);
    }

    verTodosBtn.addEventListener("click", () => renderizarTodos());
    renderizarTodos();

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
      
      const mensaje = `Hola, quiero comprar el producto: ${p.nombre}`;
      const linkWhatsapp = "https://wa.me/5493772582822?text=" + encodeURIComponent(mensaje);

      card.innerHTML = `
        <img src="img/${p.imagen}.jpg" alt="${p.nombre}">
        <h4>${p.nombre}</h4>
        <p>$${p.precio}</p>
        <p class="stock">${parseInt(p.stock) > 0 ? "En stock" : "Sin stock"}</p>
        <a class="boton-comprar" href="${linkWhatsapp}" target="_blank">Consultar</a>
      `;
      return card;
    }
  });
