export function createOpeningTitleScreen({ onComplete } = {}) {
  let rootEl = null;
  let isDestroyed = false;
  let timer = null;

  function handleAdvance() {
    if (isDestroyed) return;
    if (typeof onComplete === "function") {
      onComplete();
    }
  }

  function mount(container) {
    if (!container) return null;

    rootEl = document.createElement("div");
    rootEl.className = "opening-title-screen";

rootEl.innerHTML = `
  <main class="opening-title-screen">
    <div class="title-background"></div>

    <div class="title-cta">CLICK TO BEGIN</div>
  </main>
`;

    Object.assign(rootEl.style, {
      position: "fixed",
      inset: "0",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999",
      opacity: "0",
      transition: "opacity 1200ms ease"
    });

container.appendChild(rootEl);

requestAnimationFrame(() => {
  if (isDestroyed || !rootEl) return;
  rootEl.style.opacity = "1";
});

rootEl.addEventListener("click", handleAdvance, { once: true });

return rootEl;
  }

  function destroy() {
    isDestroyed = true;

    if (rootEl && rootEl.parentNode) {
      rootEl.parentNode.removeChild(rootEl);
    }

    rootEl = null;
  }

  return {
    mount,
    destroy
  };
}