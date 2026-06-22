/* ====================================================
   login.js — Lógica de autenticación mayorista
   Sesión con expiración por perfil (localStorage, días configurables)
   ==================================================== */

const CLAVES = {
  "nova2026":  "repuestos",
  "prod26":    "mayor",
  "admin2026": "admin"
};

/* ---------- días de sesión por perfil ---------- */
const DIAS_SESION = {
  "repuestos": 30,   // técnicos: 30 día
  "mayor":     1,   // mayoristas: 1 día (clave diaria rota igual)
  "admin":     30   // admin: 30 días
};

/* ---------- clave diaria para perfil "mayor" ---------- */
const SEMILLA_SECRETA = "nc"; // ← debe coincidir con admin/js/script.js

function generarClaveDiaria() {
  const hoy    = new Date();
  const fecha  = `${hoy.getFullYear()}${hoy.getMonth()}${hoy.getDate()}`;
  const semilla = "nova" + fecha + SEMILLA_SECRETA;
  let hash = 0;
  for (let i = 0; i < semilla.length; i++) {
    hash = ((hash << 5) - hash) + semilla.charCodeAt(i);
    hash |= 0;
  }
  return "M" + Math.abs(hash).toString().slice(0, 5);
}

/* ---------- verificar sesión guardada ---------- */
function obtenerPerfilGuardado() {
  try {
    const raw = localStorage.getItem("mayorista-auth");
    if (raw) {
      const { perfil, expira } = JSON.parse(raw);
      if (perfil && Date.now() < expira) return perfil;
    }
  } catch (e) {}
  return null;
}

function guardarSesion(perfil) {
  const dias   = DIAS_SESION[perfil] || 1;
  const expira = Date.now() + dias * 24 * 60 * 60 * 1000;
  localStorage.setItem("mayorista-auth", JSON.stringify({ perfil, expira }));
  /* Mantener sessionStorage para compatibilidad con config.js que lee PERFIL */
  sessionStorage.setItem("mayorista-perfil", perfil);
}

function verificarLogin() {
  /* Bypass para iframe de /admin/ */
  const params = new URLSearchParams(location.search);
  if (params.get("admin_perfil")) {
    document.getElementById("login-overlay").classList.add("oculto");
    return;
  }

  const perfil = obtenerPerfilGuardado();
  if (perfil) {
    /* Sincronizar sessionStorage para que config.js lea el perfil correcto */
    sessionStorage.setItem("mayorista-perfil", perfil);
    document.getElementById("login-overlay").classList.add("oculto");
  }
}

function intentarLogin() {
  const input = document.getElementById("login-pass");
  const valor = input.value.trim();

  let perfil = CLAVES[valor];
  if (!perfil && valor === generarClaveDiaria()) perfil = "mayor";

  if (perfil) {
    guardarSesion(perfil);
    location.reload();
  } else {
    document.getElementById("login-error").style.display = "block";
    input.value = "";
    input.focus();
  }
}

document.getElementById("login-btn").addEventListener("click", intentarLogin);
document.getElementById("login-pass").addEventListener("keydown", e => {
  if (e.key === "Enter") intentarLogin();
});

verificarLogin();
