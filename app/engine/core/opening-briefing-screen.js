import { gameAsset } from "../../game-config.js";
export function createOpeningBriefingScreen({ onComplete } = {}) {
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
  rootEl.className = "opening-briefing-screen";

  rootEl.innerHTML = `
    <div class="opening-briefing-screen__bg"></div>
    <button class="briefing-btn" type="button"></button>
  `;

  Object.assign(rootEl.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    opacity: "0",
    transition: "opacity 1200ms ease",
    background: "#000"
  });

  const bg = rootEl.querySelector(".opening-briefing-screen__bg");
  const btn = rootEl.querySelector(".briefing-btn");
  const dateEl = document.createElement("div");

  // Background image
  Object.assign(bg.style, {
    position: "absolute",
    inset: "0",
    backgroundImage: `url('${gameAsset("media/opening/briefing-memo.png")}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  });

  // Button aligned to the printed button area
  Object.assign(btn.style, {
    position: "absolute",
    left: "62%",
    top: "85%",
    width: "28%",
    height: "10%",
    background: "transparent",
    border: "none",
    cursor: "pointer"
  });

  btn.addEventListener("click", finish);

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

// Create formatted current date
const now = new Date();
const formattedDate = now.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric"
});

// Style the date overlay
dateEl.textContent = formattedDate;

Object.assign(dateEl.style, {
  position: "absolute",
  left: "28%",
  top: "34%",
  fontFamily: "Georgia, serif",
  fontSize: "clamp(14px, 3.5vw, 18px)",
  color: "#3b2f22",
  pointerEvents: "none"
});

rootEl.appendChild(dateEl);

}