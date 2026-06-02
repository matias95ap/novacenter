/* ====================================================
   shared/capitalizar.js — Capitalización de títulos
   Compartido entre tienda y mayorista
   ==================================================== */

function capitalizarTitulo(str) {
  const minusculas = ["y", "a", "o", "de", "para", "en", "con"];
  const mayusculas = ["hdmi", "vga", "rca", "gb", "rgb", "led", "otg", "ps2", "pc", "sata", "sd", "usb", "ok"];
  return str.toLowerCase().split(" ").map(pal => {
    if (mayusculas.includes(pal)) return pal.toUpperCase();
    if (minusculas.includes(pal)) return pal;
    return pal.charAt(0).toUpperCase() + pal.slice(1);
  }).join(" ");
}
