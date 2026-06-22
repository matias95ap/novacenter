/* ====================================================
   admin/js/login.js — Lógica de autenticación admin
   Sesión con expiración (localStorage, 30 días)
   ==================================================== */

const ADMIN_CLAVE   = "nova2730"; // ← cambiá esta contraseña
const DIAS_SESION   = 90;          // ← días antes de pedir clave de nuevo

function verificarLogin() {
  try {
    const raw = localStorage.getItem("admin-auth");
    if (raw) {
      const { ok, expira } = JSON.parse(raw);
      if (ok && Date.now() < expira) {
        document.getElementById("login-overlay").classList.add("oculto");
        return;
      }
    }
  } catch (e) {}
  // Sin sesión válida → mostrar login
}

function intentarLogin() {
  const input = document.getElementById("login-pass");
  if (input.value.trim() === ADMIN_CLAVE) {
    const expira = Date.now() + DIAS_SESION * 24 * 60 * 60 * 1000;
    localStorage.setItem("admin-auth", JSON.stringify({ ok: true, expira }));
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
