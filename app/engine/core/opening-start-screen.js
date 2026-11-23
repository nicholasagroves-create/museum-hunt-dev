export function renderOpeningStartScreen(onBegin) {
  const root = document.getElementById("opening-flow-root");

  if (!root) return;

  root.innerHTML = `
    <main class="opening-start-screen opening-flow-fade-in is-visible" id="opening-start-screen">
      <div class="opening-start-content">
        <div class="opening-start-seal-wrap">
          <img
            src="./app/games/nc-natural-sciences/media/opening/ascii-seal.png"
            alt="Archive Seal"
            class="opening-start-seal"
          />
        </div>
        <div class="opening-start-prompt">CLICK ANYWHERE TO BEGIN</div>
      </div>
    </main>
  `;

  const screen = document.getElementById("opening-start-screen");
  if (!screen) return;

  screen.addEventListener("click", () => {
    screen.classList.remove("is-visible");

    setTimeout(() => {
      if (typeof onBegin === "function") {
        onBegin();
      }
    }, 1400);
  }, { once: true });
}