/* ====================================================
   config.js — Configuración específica de Mayorista
   Las variables globales (WP, IMG_BASE, etc.) están
   en shared/config-global.js
   ==================================================== */

/* ---------- perfil de acceso (viene del login) ----------
   "repuestos" → técnicos: solo subcats de repuestos
   "mayor"     → revendedores: todo excepto repuestos
   "admin"     → acceso completo                        */
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
