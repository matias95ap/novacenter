/* ====================================================
   admin/js/script.js — Selector de modos
   Maneja los 4 botones: Ver Todos, Técnicos, Distribuidor, Minorista
   ==================================================== */

const MODOS_IFRAME = {
  tecnicos:     "/mayorista/?admin_perfil=repuestos",
  distribuidor: "/mayorista/?admin_perfil=mayor",
  minorista:    "/tienda/"
};

let _verTodosIniciado = false;

function activarModo(modo) {
  document.querySelectorAll(".btn-modo").forEach(b =>
    b.classList.toggle("activo", b.dataset.modo === modo)
  );

  const iframe = document.getElementById("iframe-modo");

  if (modo === "todos") {
    document.body.classList.remove("modo-iframe");
    iframe.src = "about:blank";

    if (!_verTodosIniciado) {
      iniciarVerTodos();
      _verTodosIniciado = true;
    }
  } else {
    document.body.classList.add("modo-iframe");
    const url = MODOS_IFRAME[modo];
    if (!iframe.src.endsWith(url)) iframe.src = url;
  }

  sessionStorage.setItem("admin-modo", modo);
}

document.querySelectorAll(".btn-modo").forEach(btn => {
  btn.addEventListener("click", () => activarModo(btn.dataset.modo));
});

/* ---------- modo inicial ---------- */
activarModo(sessionStorage.getItem("admin-modo") || "todos");
