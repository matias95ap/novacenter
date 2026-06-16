/* ====================================================
   admin/js/login.js — Lógica de autenticación admin
   Editá ADMIN_CLAVE para cambiar la contraseña
   ==================================================== */

const ADMIN_CLAVE = "admin2026"; // ← cambiá esta contraseña

function verificarLogin() {
  if (sessionStorage.getItem("admin-auth") === "1") {
    document.getElementById("login-overlay").classList.add("oculto");
  }
}

function intentarLogin() {
  const input = document.getElementById("login-pass");
  if (input.value.trim() === ADMIN_CLAVE) {
    sessionStorage.setItem("admin-auth", "1");
    document.getElementById("login-overlay").classList.add("oculto");
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
