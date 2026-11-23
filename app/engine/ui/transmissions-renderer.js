import { setActiveHintTransmission, isCharacterUnlocked } from "../../../main.js";

const CHARACTER_PORTRAITS = {
  mercer: "./app/games/nc-natural-sciences/content/characters/portraits/mercer.png",
  russell: "./app/games/nc-natural-sciences/content/characters/portraits/russell.png",
  hannah: "./app/games/nc-natural-sciences/content/characters/portraits/hannah.png",
  megan: "./app/games/nc-natural-sciences/content/characters/portraits/megan.png",
  elias: "./app/games/nc-natural-sciences/content/characters/portraits/elias.png",
  lila: "./app/games/nc-natural-sciences/content/characters/portraits/lila.png"
};

const LOCKED_PORTRAIT = "./app/games/nc-natural-sciences/content/characters/portraits/locked.png";

export function renderTransmissions(transmissions) {
  const container = document.getElementById("transmissions-feed");

  if (!container) return;

  container.innerHTML = "";

  transmissions.forEach((t, index) => {
    const bubble = document.createElement("div");

    const sideClass = index % 2 === 0 ? "left" : "right";
    const stateClass = t.state === "resolved" ? "resolved" : "active";

    const isUnlockedSender = t.characterId && isCharacterUnlocked(t.characterId);

    const portraitSrc = isUnlockedSender
      ? (CHARACTER_PORTRAITS[t.characterId] || LOCKED_PORTRAIT)
      : LOCKED_PORTRAIT;

    const portraitAlt = isUnlockedSender ? t.characterId : "Unknown sender";

    const senderMarkup = `
      <div class="transmission-sender">
        <img src="${portraitSrc}" alt="${portraitAlt}" />
      </div>
    `;

    bubble.className = `transmission ${sideClass} ${stateClass}`;

    if (t.state === "resolved") {
      bubble.style.opacity = "0.45";
      bubble.style.pointerEvents = "none";
    }

    bubble.innerHTML = `
      ${sideClass === "left" ? senderMarkup : ""}
      <div class="transmission-bubble">
        <div class="transmission-text">${t.message || ""}</div>
      </div>
      ${sideClass === "right" ? senderMarkup : ""}
    `;

    if (t.state === "active") {
      bubble.addEventListener("click", async () => {
        const archiveScreen = document.getElementById("archive-screen");
        const transmissionsScreen = document.getElementById("transmissions-screen");
        const hintScreen = document.getElementById("hint-screen");
        const scanScreen = document.getElementById("scan-screen");

        setActiveHintTransmission(t.id);

        archiveScreen.hidden = true;
        archiveScreen.classList.remove("active");

        transmissionsScreen.hidden = true;
        transmissionsScreen.classList.remove("active");

        scanScreen.hidden = true;
        scanScreen.classList.remove("active");

        hintScreen.hidden = false;
        hintScreen.classList.add("active");

        document.querySelectorAll(".nav-btn").forEach((btn) => {
          btn.classList.toggle("active", btn.dataset.tab === "transmissions");
        });

        const { renderHintScreen } = await import("./hint-screen-renderer.js");
        renderHintScreen(t);
      });
    }

    container.appendChild(bubble);
  });
}