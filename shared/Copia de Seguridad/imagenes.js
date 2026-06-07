/* ====================================================
   shared/imagenes.js — Fallback de imágenes
   Compartido entre tienda y mayorista
   IMG_BASE debe estar definida en config.js de cada sección
   ==================================================== */

function cargarImagenAlternativa(img) {
  const cod = img.dataset.codigo;
  let intento = parseInt(img.dataset.intento || "0");
  const extensiones = ["webp", "jpg", "png", "placeholder.webp"];
  intento++;
  if (intento >= extensiones.length) return;
  img.dataset.intento = intento;
  img.onerror = () => cargarImagenAlternativa(img);
  const ext = extensiones[intento];
  img.src = ext === "placeholder.webp"
    ? IMG_BASE + "placeholder.webp"
    : `${IMG_BASE}${cod}.${ext}`;
}
