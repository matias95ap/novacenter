/* ====================================================
   config.js — Configuración general de Mayorista
   ==================================================== */

const IMG_BASE    = "/datos/img/";
const JSON_BASE   = "/datos/";
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

/* ---------- filtros especiales por cliente ---------- */
const filtrosEspeciales = {
  "@Tecnico": {
    label: "Reparacion",
    perfiles: ["repuestos", "admin"],
    incluir: [
      "CELULAR Y COMPUTACION > MODULOS DISPLAY",
      "CELULAR Y COMPUTACION > BATERIAS",
      "CELULAR Y COMPUTACION > REPUESTOS CEL",
      "CELULAR Y COMPUTACION > HERRAMIENTAS E INSUMOS",
      "CELULAR Y COMPUTACION > PLACA DE CARGA"
    ]
  },
  "@modulos": {
    label: "Modulos",
    perfiles: ["repuestos", "admin"],
    incluir: ["CELULAR Y COMPUTACION > MODULOS DISPLAY"]
  },
  "@baterias": {
    label: "Baterias",
    perfiles: ["repuestos", "admin"],
    incluir: ["CELULAR Y COMPUTACION > BATERIAS"]
  },
  "@Repuestos": {
    label: "Repuestos Chicos",
    perfiles: ["repuestos", "admin"],
    incluir: ["CELULAR Y COMPUTACION > REPUESTOS CEL"]
  }
};

/* ---------- filtros visibles según el perfil activo ---------- */
const filtrosVisibles = Object.fromEntries(
  Object.entries(filtrosEspeciales).filter(([, cfg]) => cfg.perfiles.includes(PERFIL))
);
