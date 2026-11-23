export function createOpeningSponsorScreen({ onComplete } = {}) {
  let rootEl = null;
  let isDestroyed = false;
  let continueTimer = null;

  function handleAdvance() {
    if (isDestroyed) return;
    if (typeof onComplete === "function") {
      onComplete();
    }
  }

  function mount(container) {
    if (!container) return null;

    rootEl = document.createElement("div");
    rootEl.className = "opening-sponsor-screen";

rootEl.innerHTML = `
  <main class="opening-sponsor-screen">
    <div class="sponsor-background"></div>
    <div class="sponsor-darkness"></div>

    <div class="sponsor-text">
      <div class="sponsor-eyebrow">IN PARTNERSHIP WITH</div>
      <div class="sponsor-title">THE RITZ-CARLTON</div>
    </div>
  </main>
`;

Object.assign(rootEl.style, {
  position: "absolute",
  inset: "0",
  background: "#000",
  opacity: "0",
  transition: "opacity 1200ms ease"
});

    container.appendChild(rootEl);

requestAnimationFrame(() => {
  if (isDestroyed || !rootEl) return;

  rootEl.getBoundingClientRect();

  requestAnimationFrame(() => {
    if (isDestroyed || !rootEl) return;
    rootEl.style.opacity = "1";
  });
});

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