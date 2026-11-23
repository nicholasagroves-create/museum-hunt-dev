export function createOpeningTutorialScreen({ onComplete } = {}) {
  let rootEl = null;
  let isDestroyed = false;

  function finish() {
    if (isDestroyed) return;
    if (typeof onComplete === "function") {
      onComplete();
    }
  }

  function mount(container) {
    if (!container) return null;

    rootEl = document.createElement("div");
    rootEl.className = "opening-tutorial-screen";

    rootEl.innerHTML = `
      <div class="opening-tutorial-screen__inner">
        <div class="opening-tutorial-screen__label">TUTORIAL</div>
        <div class="opening-tutorial-screen__title">Recovered Orientation Mechanism</div>
        <div class="opening-tutorial-screen__body">
          Tutorial puzzle placeholder.<br />
          This will launch the real onboarding puzzle later.
        </div>
        <button class="opening-tutorial-screen__button" type="button">
          Solve Tutorial
        </button>
      </div>
    `;

    Object.assign(rootEl.style, {
      position: "fixed",
      inset: "0",
      background: "#000000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999",
      opacity: "0",
      transition: "opacity 1200ms ease",
      padding: "24px"
    });

    const inner = rootEl.querySelector(".opening-tutorial-screen__inner");
    const label = rootEl.querySelector(".opening-tutorial-screen__label");
    const title = rootEl.querySelector(".opening-tutorial-screen__title");
    const body = rootEl.querySelector(".opening-tutorial-screen__body");
    const button = rootEl.querySelector(".opening-tutorial-screen__button");

    Object.assign(inner.style, {
      width: "100%",
      maxWidth: "720px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "18px"
    });

    Object.assign(label.style, {
      color: "rgba(51, 255, 102, 0.72)",
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: "14px",
      letterSpacing: "0.28em",
      textTransform: "uppercase"
    });

    Object.assign(title.style, {
      color: "#33ff66",
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: "clamp(24px, 6vw, 40px)",
      lineHeight: "1.08",
      letterSpacing: "0.06em",
      textTransform: "uppercase"
    });

    Object.assign(body.style, {
      color: "rgba(210, 255, 220, 0.82)",
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: "clamp(15px, 3.6vw, 20px)",
      lineHeight: "1.7",
      maxWidth: "620px"
    });

    Object.assign(button.style, {
      marginTop: "10px",
      appearance: "none",
      border: "1px solid rgba(51, 255, 102, 0.45)",
      background: "rgba(0, 0, 0, 0.9)",
      color: "#33ff66",
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: "16px",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      padding: "14px 22px",
      cursor: "pointer"
    });

    button.addEventListener("click", () => {
      finish();
    });

    container.appendChild(rootEl);

    requestAnimationFrame(() => {
      if (!rootEl || isDestroyed) return;
      rootEl.style.opacity = "1";
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