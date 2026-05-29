/* ====================================================
   analytics.js — Google Analytics 4 + Meta Pixel + Eventos
   Archivo compartido para novacenter.ar, /tienda y /mayorista
   ==================================================== */

/* ---------- Google Analytics 4 ---------- */
(function () {
  const script = document.createElement("script");
  script.async = true;
  script.src   = "https://www.googletagmanager.com/gtag/js?id=G-1Q23BWRJHV";
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", "G-1Q23BWRJHV");
})();

/* ---------- Meta Pixel ---------- */
(function (f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n; n.loaded = true; n.version = "2.0";
  n.queue = [];
  t = b.createElement(e); t.async = true;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
})(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

fbq("init", "738732103707719");
fbq("track", "PageView");

/* Noscript fallback */
(function () {
  const ns  = document.createElement("noscript");
  const img = document.createElement("img");
  img.height = 1; img.width = 1;
  img.style.display = "none";
  img.src = "https://www.facebook.com/tr?id=738732103707719&ev=PageView&noscript=1";
  ns.appendChild(img);
  document.body.appendChild(ns);
})();

/* ====================================================
   EVENTOS PERSONALIZADOS
   Se activan automáticamente en las 3 páginas
   ==================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const pagina = location.pathname.replace(/\/$/, "") || "/";

  /* ---------- 1. Click en WhatsApp ----------
     Registra cada vez que alguien toca "Consultar" o el botón de WA
     En GA4: Eventos > whatsapp_click
     En Meta Pixel: evento Lead (conversión)                          */
  document.addEventListener("click", function (e) {
    const link = e.target.closest("a");
    if (!link) return;
    const href = link.href || "";

    if (href.includes("wa.me")) {
      // Intentar extraer nombre del producto del texto del link o del h2 cercano
      const textoBoton = link.textContent.trim();
      const h2 = document.querySelector(".producto-detalle h2");
      const nombreProducto = h2 ? h2.textContent.trim() : textoBoton;

      gtag("event", "whatsapp_click", {
        event_category: "contacto",
        event_label: nombreProducto,
        pagina: pagina
      });

      fbq("track", "Lead", {
        content_name: nombreProducto,
        content_category: pagina
      });
    }
  });

  /* ---------- 2. Ver detalle de producto ----------
     Se dispara cuando navegarProducto() muestra un producto
     En GA4: Eventos > ver_producto                        */
  const _navegarOriginal = window.navegarProducto;
  if (typeof _navegarOriginal === "function") {
    window.navegarProducto = function (codigo) {
      gtag("event", "ver_producto", {
        event_category: "producto",
        event_label: codigo,
        pagina: pagina
      });
      fbq("track", "ViewContent", {
        content_ids: [codigo],
        content_type: "product"
      });
      _navegarOriginal(codigo);
    };
  } else {
    // Si navegarProducto aún no está definida, la interceptamos cuando se defina
    let _codigosPendientes = [];
    Object.defineProperty(window, "navegarProducto", {
      set: function (fn) {
        this._navegarProductoFn = function (codigo) {
          gtag("event", "ver_producto", {
            event_category: "producto",
            event_label: codigo,
            pagina: pagina
          });
          fbq("track", "ViewContent", {
            content_ids: [codigo],
            content_type: "product"
          });
          fn(codigo);
        };
      },
      get: function () {
        return this._navegarProductoFn;
      },
      configurable: true
    });
  }

  /* ---------- 3. Clicks en secciones del sidebar ----------
     Registra qué secciones especiales visitan más
     En GA4: Eventos > click_seccion                         */
  const secciones = {
    "ver-todos":      "Ver Todos",
    "ver-nuevos":     "Nuevos Ingresos",
    "ver-liquidacion": "Liquidacion",
    "ver-dia-nino":   "Novedades para Regalar"
  };

  Object.entries(secciones).forEach(([id, nombre]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        gtag("event", "click_seccion", {
          event_category: "navegacion",
          event_label: nombre,
          pagina: pagina
        });
      });
    }
  });

  /* ---------- 4. Búsqueda de productos ----------
     Registra qué buscan los clientes (con debounce de 1s)
     En GA4: Eventos > busqueda_producto                    */
  const inputBuscar = document.getElementById("input-buscar");
  if (inputBuscar) {
    let timerBusqueda = null;
    inputBuscar.addEventListener("input", function () {
      clearTimeout(timerBusqueda);
      const termino = this.value.trim();
      if (termino.length < 3) return;
      timerBusqueda = setTimeout(() => {
        gtag("event", "busqueda_producto", {
          event_category: "busqueda",
          search_term: termino,
          pagina: pagina
        });
      }, 1000); // espera 1 segundo después de que el usuario para de escribir
    });
  }

  /* ---------- 5. Click en redes sociales (solo biolink) ----------
     Registra qué red social clickean desde novacenter.ar
     En GA4: Eventos > click_red_social                             */
  const redesSociales = {
    "instagram.com":  "Instagram",
    "tiktok.com":     "TikTok",
    "facebook.com":   "Facebook"
  };

  document.addEventListener("click", function (e) {
    const link = e.target.closest("a");
    if (!link) return;
    const href = link.href || "";
    for (const [dominio, nombre] of Object.entries(redesSociales)) {
      if (href.includes(dominio)) {
        gtag("event", "click_red_social", {
          event_category: "redes_sociales",
          event_label: nombre,
          pagina: pagina
        });
        break;
      }
    }
  });

  /* ---------- 6. Filtro liquidación mayorista ----------
     Solo aplica en /mayorista, registra uso de filtros
     En GA4: Eventos > click_filtro_mayorista              */
  const filtrosBtns = document.querySelectorAll(".btn-filtro-especial");
  filtrosBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      gtag("event", "click_filtro_mayorista", {
        event_category: "mayorista",
        event_label: btn.textContent.trim(),
        pagina: pagina
      });
    });
  });

});
