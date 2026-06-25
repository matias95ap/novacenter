(function () {
    const splash = document.getElementById("splash-screen");
    if (!splash) return;

    const MIN_MS = 1200;
    const t0 = Date.now();

    function ocultar() {
        const restante = MIN_MS - (Date.now() - t0);
        setTimeout(() => {
            splash.classList.add("hide");
            splash.addEventListener("transitionend", () => splash.remove(), { once: true });
        }, Math.max(0, restante));
    }

    window.addEventListener("load", ocultar, { once: true });
    setTimeout(ocultar, 6000);
})();
