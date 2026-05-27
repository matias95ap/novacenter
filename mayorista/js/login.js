/* ====================================================
   login.js — Lógica de autenticación
   Editá CLAVES para cambiar contraseñas y perfiles:
     "repuestos" → técnicos (solo repuestos de celular)
     "mayor"     → revendedores (todo excepto repuestos)
     "admin"     → acceso completo
   ==================================================== */

const CLAVES = {
  "nova2026":  "repuestos",
  "prod26":  "mayor",
  "admin2026": "admin"
};

function verificarLogin() {
  if (sessionStorage.getItem("mayorista-perfil")) {
    document.getElementById("login-overlay").classList.add("oculto");
  }
}

function intentarLogin() {
  const input  = document.getElementById("login-pass");
  const perfil = CLAVES[input.value.trim()];
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
