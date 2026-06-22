/* ====================================================
   login.js — Lógica de autenticación
   Editá CLAVES para cambiar contraseñas y perfiles:
     "repuestos" → técnicos (solo repuestos de celular)
     "mayor"     → revendedores (clave fija + clave diaria)
     "admin"     → acceso completo

   Si la URL tiene ?admin_perfil=X (usado por /admin/ vía iframe),
   se omite el login completamente.
   ==================================================== */

const CLAVES = {
  "nova2026":  "repuestos",
  "prod26":    "mayor",      // ← clave fija para mayoristas
  "admin2026": "admin"
};

/* ---------- clave diaria para perfil "mayor" ----------
   Cambia automáticamente cada 24hs a medianoche.
   Cambiá la SEMILLA_SECRETA para que nadie pueda predecirla. */
const SEMILLA_SECRETA = "nc"; // ← cambiá esto por tu clave secreta

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

function verificarLogin() {
  const params = new URLSearchParams(location.search);
  if (params.get("admin_perfil")) {
    document.getElementById("login-overlay").classList.add("oculto");
    return;
  }
  if (sessionStorage.getItem("mayorista-perfil")) {
    document.getElementById("login-overlay").classList.add("oculto");
  }
}

function intentarLogin() {
  const input = document.getElementById("login-pass");
  const valor = input.value.trim();

  let perfil = CLAVES[valor];

  /* Si no coincide con claves fijas, probar con la clave diaria */
  if (!perfil && valor === generarClaveDiaria()) {
    perfil = "mayor";
  }

  if (perfil) {
    sessionStorage.setItem("mayorista-perfil", perfil);
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
