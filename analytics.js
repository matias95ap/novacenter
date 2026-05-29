/* ====================================================
   analytics.js — Google Analytics 4 + Meta Pixel
   Archivo compartido para novacenter.ar, /tienda y /mayorista
   Editá solo este archivo si cambian los IDs
   ==================================================== */

/* ---------- Google Analytics 4 ---------- */
(function () {
  const script = document.createElement("script");
  script.async = true;
  script.src   = "https://www.googletagmanager.com/gtag/js?id=G-1Q23BWRJHV";
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", "G-1Q23BWRJHV");
})();

/* ---------- Meta Pixel ---------- */
(function (f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n; n.loaded = true; n.version = "2.0";
  n.queue = [];
  t = b.createElement(e); t.async = true;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
})(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

fbq("init", "738732103707719");
fbq("track", "PageView");

/* Noscript fallback (se inserta automáticamente) */
(function () {
  const ns = document.createElement("noscript");
  const img = document.createElement("img");
  img.height = 1; img.width = 1;
  img.style.display = "none";
  img.src = "https://www.facebook.com/tr?id=738732103707719&ev=PageView&noscript=1";
  ns.appendChild(img);
  document.body.appendChild(ns);
})();
