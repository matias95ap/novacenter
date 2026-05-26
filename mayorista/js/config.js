/* ====================================================
   config.js — Configuración general de Mayorista
   Editá este archivo para cambiar:
   - Número de WhatsApp
   - Rutas de archivos
   - Subcategorías de repuestos
   - Filtros especiales por cliente y por perfil
   ==================================================== */

const IMG_BASE    = "../tienda/img/";
const JSON_BASE   = "../tienda/";
const WP_NUMBER   = "5493772582822";
const TIENDA_BASE = "https://novacenter.ar/tienda/";

/* ---------- perfil de acceso (viene del login) ----------
   "repuestos" → técnicos: ve solo subcats de repuestos + filtros especiales
   "mayor"     → kioscos/revendedores: ve todo excepto repuestos, solo categorías en sidebar
   "admin"     → ve todo + todos los filtros especiales                       */
const PERFIL = sessionStorage.getItem("mayorista-perfil") || "mayor";

/* ---------- subcategorías de repuestos/técnicos ---------- */
const SUBCATS_REPUESTOS = [
  "CELULAR Y COMPUTACION > MODULOS DISPLAY",
  "CELULAR Y COMPUTACION > BATERIAS",
  "CELULAR Y COMPUTACION > REPUESTOS CEL",
  "CELULAR Y COMPUTACION > HERRAMIENTAS E INSUMOS",
  "CELULAR Y COMPUTACION > PLACA DE CARGA"
];

/* ---------- filtros especiales por cliente ----------
   Solo se muestran para los perfiles "repuestos" y "admin"
   label     → nombre que aparece en el botón del sidebar
   incluir   → solo muestra estas subcategorías (si se define)
   excluir   → oculta estas subcategorías (si se define)      */
const filtrosEspeciales = {
  "@modulos": {
    label: "Modulos",
    perfiles: ["repuestos", "admin"],
    incluir: [
      "CELULAR Y COMPUTACION > MODULOS DISPLAY"
    ]
  },
  "@baterias": {
    label: "Baterias",
    perfiles: ["repuestos", "admin"],
    incluir: [
      "CELULAR Y COMPUTACION > BATERIAS"
    ]
  },
  "@Placas": {
    label: "Placas de Carga",
    perfiles: ["repuestos", "admin"],
    incluir: [
      "CELULAR Y COMPUTACION > PLACA DE CARGA"
    ]
  },
  "@Repuestos": {
    label: "Repuestos Chicos",
    perfiles: ["repuestos", "admin"],
    incluir: [
      "CELULAR Y COMPUTACION > REPUESTOS CEL"
    ]
  },
  "@Tecnico": {
    label: "Herramientas Insumos",
    perfiles: ["repuestos", "admin"],
    incluir: [
      "CELULAR Y COMPUTACION > HERRAMIENTAS E INSUMOS",
    ]
  },
};

/* ---------- filtros visibles según el perfil activo ---------- */
const filtrosVisibles = Object.fromEntries(
  Object.entries(filtrosEspeciales).filter(([, cfg]) => cfg.perfiles.includes(PERFIL))
);
