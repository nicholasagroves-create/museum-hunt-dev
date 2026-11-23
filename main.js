import { loadCharacterArchive } from "./app/engine/archive/archive-data-loader.js";
import { initializeGlobalAudioController } from "./app/engine/core/global-audio-controller.js";
import { mountGlobalMuteButton } from "./app/engine/ui/global-mute-button.js";
import { createOpeningTutorialScreen } from "./app/engine/core/opening-tutorial-screen.js";
import { showCharacterSheetModal } from "./app/engine/ui/character-sheet-modal.js";
import { showArchiveRulesModal } from "./app/engine/ui/archive-rules-modal.js";
import { renderScanScreen } from "./app/engine/scan/scan-screen.js";
import { renderOpeningStudioScreen } from "./app/engine/core/opening-studio-screen.js";
import { playStudioSequence } from "./app/engine/core/start-sequence-controller.js";
import { renderOpeningStartScreen } from "./app/engine/core/opening-start-screen.js";
import { renderOpeningTerminalScreen } from "./app/engine/core/opening-terminal-screen.js";
import { createOpeningSponsorScreen } from "./app/engine/core/opening-sponsor-screen.js";
import { createOpeningTitleScreen } from "./app/engine/core/opening-title-screen.js";
import { createOpeningBriefingScreen } from "./app/engine/core/opening-briefing-screen.js";

let activeCharacterId = "mercer";
let onboardingRevealPlan = null;
let transmissions = [];
let activeHintTransmissionId = null;
let runtimePuzzleState = {};

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("./app/engine/pwa/service-worker.js");
    console.log("Service worker registered.");
  } catch (error) {
    console.error("Service worker registration failed:", error);
  }
}

const characters = [
  {
    id: "mercer",
    name: "Mercer",
    active: true,
    locked: false,
    portrait: "./app/games/nc-natural-sciences/content/characters/portraits/mercer.png"
  },
  {
    id: "russell",
    name: "Russell",
    active: false,
    locked: true,
    portrait: "./app/games/nc-natural-sciences/content/characters/portraits/russell.png"
  },
  {
    id: "hannah",
    name: "Hannah",
    active: false,
    locked: true,
    portrait: "./app/games/nc-natural-sciences/content/characters/portraits/hannah.png"
  },
  {
    id: "megan",
    name: "Megan",
    active: false,
    locked: true,
    portrait: "./app/games/nc-natural-sciences/content/characters/portraits/megan.png"
  },
  {
    id: "elias",
    name: "Elias",
    active: false,
    locked: true,
    portrait: "./app/games/nc-natural-sciences/content/characters/portraits/elias.png"
  },
  {
    id: "lila",
    name: "Lila",
    active: false,
    locked: true,
    portrait: "./app/games/nc-natural-sciences/content/characters/portraits/lila.png"
  }
];

/* ========================================
   CHARACTER SHEET DATA
======================================== */
const characterSheetData = {
  mercer: {
    name: "Dr. Jonathan Mercer",
    role: "Expedition Lead / Systems Archaeologist",
    portrait: "./app/games/nc-natural-sciences/content/characters/portraits/mercer.png",
    description: `
Mercer led the original expedition into the museum complex.

His work focused on identifying and activating the underlying system connecting the site’s mechanisms. Early logs suggest he was the first to recognize that the structure was not a collection of exhibits, but a unified system.

Most recovered records originate from Mercer.

His final transmissions are incomplete.
    `
  }
};

function setActiveCharacter(characterId) {
  activeCharacterId = characterId;

  characters.forEach((character) => {
    character.active = character.id === characterId;
  });
}

async function renderActiveArchive() {
  const archiveData = await loadCharacterArchive(activeCharacterId);

  const override = runtimePuzzleState[activeCharacterId];

  if (override) {
    archiveData.slots = archiveData.slots.map((slot) => {
      if (slot.position !== override.slotIndex) {
        return {
          ...slot,
          state: "unknown"
        };
      }

      return {
        ...slot,
        id: override.puzzleId,
        title: override.title,
        state: "completed"
      };
    });
  }

  renderArchiveGrid(archiveData);
}

function renderCharacterStrip() {
  const strip = document.getElementById("character-strip");
  if (!strip) return;

  strip.innerHTML = "";

  characters.forEach((character) => {
    const card = document.createElement("button");
    card.className = `character-card${character.active ? " active" : ""}${character.locked ? " locked" : ""}`;
    card.type = "button";

    const portrait = character.locked
      ? `<img src="./app/games/nc-natural-sciences/content/characters/portraits/locked.png" alt="Locked" />`
      : `<img src="${character.portrait}" alt="${character.name}" />`;

    const displayName = character.locked ? "Locked" : character.name;

    card.innerHTML = `
      <div class="character-portrait">${portrait}</div>
      <div class="character-name">${displayName}</div>
    `;

    card.addEventListener("click", async () => {
      if (character.locked) return;

      if (character.active) {
        if (character.id === "mercer") {
          showCharacterSheetModal(characterSheetData.mercer);
        }
        return;
      }

      setActiveCharacter(character.id);
      renderCharacterStrip();
      await renderActiveArchive();
    });

    strip.appendChild(card);
  });
}

/* ========================================
   CHARACTER REVEAL UTILITIES
======================================== */

/* ========================================
   CHARACTER REVEAL UTILITIES
======================================== */

function flashCharacterReveal(characterId) {
  const strip = document.getElementById("character-strip");
  if (!strip) return Promise.resolve();

  const cards = [...strip.querySelectorAll(".character-card")];
  const targetIndex = characters.findIndex((character) => character.id === characterId);
  const targetCard = cards[targetIndex];

  if (!targetCard) return Promise.resolve();

  targetCard.classList.add("is-revealing");

  return new Promise((resolve) => {
    window.setTimeout(() => {
      targetCard.classList.remove("is-revealing");
      resolve();
    }, 1800);
  });
}

/* ========================================
   GUIDED NAV UTILITIES
======================================== */
function flashBottomNavButton(tabName) {
  const button = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
  if (!button) return Promise.resolve();

  button.classList.add("is-guided-flash");

  return new Promise((resolve) => {
    window.setTimeout(() => {
      button.classList.remove("is-guided-flash");
      resolve();
    }, 3600);
  });
}

function renderArchiveGrid(archiveData) {
  const grid = document.getElementById("archive-grid");
  const label = document.getElementById("active-path-label");

  if (!grid || !label) return;

  grid.innerHTML = "";
  label.textContent = archiveData.label || "ARCHIVE";

  const sortedSlots = [...archiveData.slots].sort((a, b) => a.position - b.position);

  sortedSlots.forEach((tile) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `archive-tile ${tile.state}`;

    const isInteractive = tile.state === "unlocked" || tile.state === "completed";
    if (!isInteractive) {
      button.disabled = true;
    }

    const title = tile.state === "unknown" ? "" : tile.title || "";
    const artContent = tile.state === "unknown" ? "" : tile.icon || "✦";

    button.innerHTML = `
      <div class="tile-art">${artContent}</div>
      <div class="tile-body">
        <div class="tile-title">${title}</div>
      </div>
    `;

    button.addEventListener("click", () => {
      if (!isInteractive) return;

      document.querySelectorAll(".archive-tile").forEach((el) => {
        el.classList.remove("active");
      });

      button.classList.add("active");

      console.log("Tile clicked:", {
        character: activeCharacterId,
        id: tile.id,
        type: tile.type,
        state: tile.state
      });
    });

    grid.appendChild(button);
  });
}

function updateTransmissionsNavBadge() {
  const unresolvedCount = transmissions.filter((t) => t.state !== "resolved").length;

  const badgeIds = [
    "transmissions-nav-badge-archive",
    "transmissions-nav-badge-transmissions",
    "transmissions-nav-badge-hint",
    "transmissions-nav-badge-scan"
  ];

  badgeIds.forEach((id) => {
    const badge = document.getElementById(id);
    if (!badge) return;

    if (unresolvedCount > 0) {
      badge.textContent = String(unresolvedCount);
      badge.setAttribute("data-count", String(unresolvedCount));
    } else {
      badge.textContent = "";
      badge.setAttribute("data-count", "0");
    }
  });
}

/* ========================================
   TRANSMISSIONS RENDERING
======================================== */
function refreshTransmissionsScreen(displayedTransmissions = transmissions) {
  import("./app/engine/ui/transmissions-renderer.js").then(({ renderTransmissions }) => {
    renderTransmissions(displayedTransmissions);
  });

  updateTransmissionsNavBadge();
}

/* ========================================
   TRANSMISSIONS SEQUENCE UTILITIES
======================================== */
async function playSeededTransmissionsSequence() {
  const ordered = [...transmissions];
  const revealed = [];

  for (const transmission of ordered) {
    revealed.push(transmission);
    refreshTransmissionsScreen([...revealed]);
    await new Promise((resolve) => setTimeout(resolve, 550));
  }
}

function createScanScreen() {
  return renderScanScreen({
    onSubmitCode: async (match) => {
      await handleScannedCode(match);
    },
  });
}

function mountScanScreen() {
  const scanScreen = document.getElementById("scan-screen");
  if (!scanScreen) return;

  scanScreen.innerHTML = "";
  scanScreen.appendChild(createScanScreen());
}

async function handleScannedCode(match) {
  const scanScreen = document.getElementById("scan-screen");
  if (!scanScreen) return;

  const existingState = runtimePuzzleState[match.characterId];
  if (existingState && existingState.puzzleId === match.puzzleId) {
    mountScanScreen();
    return;
  }

  // Clear scan UI
  scanScreen.innerHTML = "";

  // Create placeholder puzzle screen
  const wrapper = document.createElement("div");
  wrapper.className = "puzzle-screen";

  wrapper.innerHTML = `
    <div class="puzzle-screen__inner">
      <h1>${match.title}</h1>
      <p>Placeholder puzzle experience.</p>
      <button id="solve-puzzle-btn">Solve Puzzle</button>
    </div>
  `;

  scanScreen.appendChild(wrapper);

  const solveButton = document.getElementById("solve-puzzle-btn");

  solveButton.addEventListener("click", async () => {
console.log("[PUZZLE] solved:", match);

// Return to archive
const archiveScreen = document.getElementById("archive-screen");
const transmissionsScreen = document.getElementById("transmissions-screen");
const hintScreen = document.getElementById("hint-screen");

if (archiveScreen) {
  archiveScreen.hidden = false;
  archiveScreen.classList.add("active");
}

if (transmissionsScreen) {
  transmissionsScreen.hidden = true;
  transmissionsScreen.classList.remove("active");
}

if (hintScreen) {
  hintScreen.hidden = true;
  hintScreen.classList.remove("active");
}

if (scanScreen) {
  scanScreen.hidden = true;
  scanScreen.classList.remove("active");
}

// 🔥 NEW: unlock + reveal Megan
unlockCharacter(match.characterId);

runtimePuzzleState[match.characterId] = {
  puzzleId: match.puzzleId,
  slotIndex: match.slotIndex,
  title: match.title
};

await flashCharacterReveal(match.characterId);

showCharacterSheetModal({
  name: "Megan Vale",
  role: "Archivist / Records Specialist",
  portrait: "./app/games/nc-natural-sciences/content/characters/portraits/megan.png",
  description: `
Megan was responsible for documenting and preserving the expedition’s findings.

Her logs indicate a deep awareness of inconsistencies in the records—gaps, omissions, patterns that didn’t align.

She began to suspect that not everything was being recorded.

Some things may have been deliberately left out.
  `,
  onClose: async () => {
    setActiveCharacter(match.characterId);
    renderCharacterStrip();
    await renderActiveArchive();
    resolveTransmissionByPuzzleId(match.puzzleId);
    mountScanScreen();
  }
});
  });
}

/* ========================================
   BOTTOM NAV
======================================== */

function wireBottomNav() {
  const archiveScreen = document.getElementById("archive-screen");
  const transmissionsScreen = document.getElementById("transmissions-screen");
  const hintScreen = document.getElementById("hint-screen");
  const scanScreen = document.getElementById("scan-screen");

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const tab = button.dataset.tab;

      document.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === tab);
      });

      if (tab === "archive") {
        archiveScreen.hidden = false;
        archiveScreen.classList.add("active");

        transmissionsScreen.hidden = true;
        transmissionsScreen.classList.remove("active");

        hintScreen.hidden = true;
        hintScreen.classList.remove("active");

        scanScreen.hidden = true;
        scanScreen.classList.remove("active");

        await renderActiveArchive();
      }

      if (tab === "transmissions") {
        archiveScreen.hidden = true;
        archiveScreen.classList.remove("active");

        transmissionsScreen.hidden = false;
        transmissionsScreen.classList.add("active");

        hintScreen.hidden = true;
        hintScreen.classList.remove("active");

        scanScreen.hidden = true;
        scanScreen.classList.remove("active");

        refreshTransmissionsScreen();
      }

      if (tab === "scan") {
        archiveScreen.hidden = true;
        archiveScreen.classList.remove("active");

        transmissionsScreen.hidden = true;
        transmissionsScreen.classList.remove("active");

        hintScreen.hidden = true;
        hintScreen.classList.remove("active");

        scanScreen.hidden = false;
        scanScreen.classList.add("active");
      }
    });
  });
}

function unlockCharacter(characterId) {
  const character = characters.find((c) => c.id === characterId);

  if (!character) return;

  character.locked = false;
}

export function isCharacterUnlocked(characterId) {
  const character = characters.find((c) => c.id === characterId);
  return character ? !character.locked : false;
}

function resolveTransmissionByPuzzleId(targetPuzzleId) {
  const normalizedTarget = String(targetPuzzleId || "").trim().toLowerCase();

  const transmission = transmissions.find((t) => {
    const transmissionPuzzleId = String(t.targetPuzzleId || "").trim().toLowerCase();
    const transmissionMessage = String(t.message || "").trim().toLowerCase();

    return (
      transmissionPuzzleId === normalizedTarget ||
      transmissionMessage.includes(normalizedTarget)
    );
  });

  if (!transmission) return null;

  transmission.state = "resolved";
  refreshTransmissionsScreen();
  return transmission;
}

export function clearActiveHintTransmission() {
  activeHintTransmissionId = null;
}

export function setActiveHintTransmission(transmissionId) {
  activeHintTransmissionId = transmissionId;
}

export function getActiveHintTransmissionId() {
  return activeHintTransmissionId;
}

export function resolveTransmissionById(transmissionId) {
  const transmission = transmissions.find((t) => t.id === transmissionId);

  if (!transmission) return null;

  transmission.state = "resolved";
  refreshTransmissionsScreen();
  return transmission;
}

export function resolveActiveHintTransmissionFromScan(scannedPuzzleId) {
  if (!activeHintTransmissionId) return null;

  const transmission = transmissions.find((t) => t.id === activeHintTransmissionId);

  if (!transmission) return null;
  if (transmission.targetPuzzleId !== scannedPuzzleId) return null;

  transmission.state = "resolved";
  activeHintTransmissionId = null;
  refreshTransmissionsScreen();
  return transmission;
}

function triggerOpeningCrtBurst(onComplete) {
  const burst = document.createElement("div");
  burst.className = "opening-crt-burst";

  document.body.appendChild(burst);

  setTimeout(() => {
    burst.remove();
    if (typeof onComplete === "function") {
      onComplete();
    }
  }, 420);
}

/* ========================================
   BOOT FUNCTION
======================================== */

async function boot() {
  initializeGlobalAudioController();
  mountGlobalMuteButton();
  registerServiceWorker();

/* ========================================
   DEV MODE FLAGS (load screen)
======================================== */
const DEV_START_AT = "opening";

/* ========================================
   INITIAL CHARACTER LOCK STATE
======================================== */
characters.forEach((character) => {
  character.locked = true;
});

// options: "opening" | "tutorial" | "archive"

  const { loadOnboardingConfig, buildOnboardingRevealPlan } = await import("./app/engine/narrative/onboarding-controller.js");
  const onboardingConfig = await loadOnboardingConfig();
  onboardingRevealPlan = buildOnboardingRevealPlan(onboardingConfig);

  const { loadArchiveIndex } = await import("./app/engine/archive/archive-loader.js");

  const archiveData = await loadArchiveIndex(
    "./app/games/nc-natural-sciences/content/archive/archive-index.json",
    "./app/games/nc-natural-sciences"
  );

const mercerSeeded = archiveData.transmissions
  .filter((t) => t.characterId === onboardingRevealPlan.mercer)
  .slice(0, onboardingRevealPlan.seededTransmissionRules.mercerCount);

const nonMercerSeeded = onboardingRevealPlan.seededNonMercerCharacters.flatMap((characterId) =>
  archiveData.transmissions
    .filter((t) => t.characterId === characterId)
    .slice(0, onboardingRevealPlan.seededTransmissionRules.nonMercerPerCharacter)
);

transmissions = [...mercerSeeded, ...nonMercerSeeded].map((t) => ({
  ...t,
  state: t.state || "active"
}));

  window.__museumHuntTransmissions = transmissions;

setActiveCharacter("mercer");
renderCharacterStrip();
mountScanScreen();
wireBottomNav();
refreshTransmissionsScreen();

/* ========================================
   INITIAL SCREEN VISIBILITY
======================================== */
const openingFlowScreen = document.getElementById("opening-flow-screen");
const archiveScreen = document.getElementById("archive-screen");

if (DEV_START_AT === "opening") {
  if (openingFlowScreen) {
    openingFlowScreen.hidden = false;
    openingFlowScreen.classList.add("active");
  }

  if (archiveScreen) {
    archiveScreen.hidden = true;
    archiveScreen.classList.remove("active");
    archiveScreen.classList.remove("is-visible");
  }
}

if (DEV_START_AT === "studio") {
  if (openingFlowScreen) {
    openingFlowScreen.hidden = false;
    openingFlowScreen.classList.add("active");
  }

  if (archiveScreen) {
    archiveScreen.hidden = true;
    archiveScreen.classList.remove("active");
    archiveScreen.classList.remove("is-visible");
  }
}

if (DEV_START_AT === "tutorial") {
  if (openingFlowScreen) {
    openingFlowScreen.hidden = false;
    openingFlowScreen.classList.add("active");
  }

  if (archiveScreen) {
    archiveScreen.hidden = true;
    archiveScreen.classList.remove("active");
    archiveScreen.classList.remove("is-visible");
  }
}

if (DEV_START_AT === "archive") {
  if (openingFlowScreen) {
    openingFlowScreen.hidden = true;
    openingFlowScreen.classList.remove("active");
  }

  if (archiveScreen) {
    archiveScreen.hidden = false;
    archiveScreen.classList.add("active");
    archiveScreen.classList.remove("is-visible");
  }
}

/* ========================================
   OPENING / DEV ENTRY POINT
======================================== */
if (DEV_START_AT === "opening") {
  const sponsorFireAudio = document.getElementById("sponsor-fire-audio");
  const titleCardAudio = document.getElementById("title-card-audio");

  const STUDIO_FADE_OUT_MS = 1200;
  const BLACK_BUFFER_MS = 1000;
  const SPONSOR_HOLD_MS = 5500;
  const SPONSOR_FADE_OUT_MS = 1200;
  const TITLE_BUFFER_MS = 3300;

  function finishOpeningToArchive() {
    const openingFlowScreen = document.getElementById("opening-flow-screen");
    const archiveScreen = document.getElementById("archive-screen");

    if (openingFlowScreen) {
      openingFlowScreen.hidden = true;
      openingFlowScreen.classList.remove("active");
    }

    if (archiveScreen) {
      archiveScreen.hidden = false;
      archiveScreen.classList.add("active");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          archiveScreen.classList.add("is-visible");
        });
      });
    }

    renderActiveArchive();
  }

function goToTutorial() {
  const flowRoot = document.getElementById("opening-flow-root");
  if (!flowRoot) return;

  flowRoot.innerHTML = "";

  const tutorialScreen = createOpeningTutorialScreen({
    onComplete: async () => {
      tutorialScreen.destroy();

      const openingFlowScreen = document.getElementById("opening-flow-screen");
      const archiveScreen = document.getElementById("archive-screen");

      if (openingFlowScreen) {
        openingFlowScreen.hidden = true;
        openingFlowScreen.classList.remove("active");
      }

      // 1. Prepare archive (not visible yet)
      if (archiveScreen) {
        archiveScreen.hidden = false;
        archiveScreen.classList.add("active");
        archiveScreen.classList.remove("is-visible");
        archiveScreen.classList.add("archive-pre-reveal");
      }

      // 2. Render archive content first
      await renderActiveArchive();

      // 3. Short cinematic pause
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 4. Fade archive in
      if (archiveScreen) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            archiveScreen.classList.add("is-visible");
          });
        });
      }

      // 5. Pause after fade
      await new Promise((resolve) => setTimeout(resolve, 900));

      // 6. Flash locked Mercer portrait
      await flashCharacterReveal("mercer");

      // 7. Mercer reveal popup
      showCharacterSheetModal({
        ...characterSheetData.mercer,
        onClose: async () => {
          const mercer = characters.find((character) => character.id === "mercer");

          if (mercer) {
            mercer.locked = false;
          }

          setActiveCharacter("mercer");
          renderCharacterStrip();

          if (archiveScreen) {
            archiveScreen.classList.remove("archive-pre-reveal");
          }

          const pathLabel = document.getElementById("active-path-label");
          const grid = document.getElementById("archive-grid");

          if (pathLabel) {
            pathLabel.textContent = "MERCER'S PATH";
          }

          if (grid) {
            grid.innerHTML = "";
          }

          await new Promise((resolve) => setTimeout(resolve, 450));

          await renderActiveArchive();

          const firstTile = document.querySelector("#archive-grid .archive-tile");
          if (firstTile) {
            firstTile.classList.add("is-revealing");

            window.setTimeout(() => {
              firstTile.classList.remove("is-revealing");
            }, 1600);
          }

          await new Promise((resolve) => setTimeout(resolve, 900));

          showArchiveRulesModal({
            title: "Archive Records",
            body: `
When puzzles are solved, recovered expedition records will be placed here.

Each character’s path will fill as more of the archive is restored.
    `,
            buttonLabel: "Continue",
            onClose: async () => {
              await flashBottomNavButton("transmissions");

              const archiveScreen = document.getElementById("archive-screen");
              const transmissionsScreen = document.getElementById("transmissions-screen");
              const hintScreen = document.getElementById("hint-screen");
              const scanScreen = document.getElementById("scan-screen");

              if (archiveScreen) {
                archiveScreen.hidden = true;
                archiveScreen.classList.remove("active");
              }

              if (transmissionsScreen) {
                transmissionsScreen.hidden = false;
                transmissionsScreen.classList.add("active");
              }

              if (hintScreen) {
                hintScreen.hidden = true;
                hintScreen.classList.remove("active");
              }

              if (scanScreen) {
                scanScreen.hidden = true;
                scanScreen.classList.remove("active");
              }

              // Start with empty feed
              refreshTransmissionsScreen([]);

              // Play reveal sequence
              await playSeededTransmissionsSequence();

              // Pause after messages
              await new Promise((resolve) => setTimeout(resolve, 600));

              // Rules popup 2
              showArchiveRulesModal({
                title: "Transmissions",
                body: `
Messages from the expedition team will appear here.

Some transmissions may contain guidance on where to find puzzles in the environment.
    `,
                buttonLabel: "Continue",
                onClose: async () => {
                  const archiveScreen = document.getElementById("archive-screen");
                  const transmissionsScreen = document.getElementById("transmissions-screen");
                  const hintScreen = document.getElementById("hint-screen");
                  const scanScreen = document.getElementById("scan-screen");

                  if (archiveScreen) {
                    archiveScreen.hidden = false;
                    archiveScreen.classList.add("active");
                  }

                  if (transmissionsScreen) {
                    transmissionsScreen.hidden = true;
                    transmissionsScreen.classList.remove("active");
                  }

                  if (hintScreen) {
                    hintScreen.hidden = true;
                    hintScreen.classList.remove("active");
                  }

                  if (scanScreen) {
                    scanScreen.hidden = true;
                    scanScreen.classList.remove("active");
                  }

                  setActiveCharacter("mercer");
                  renderCharacterStrip();
                  await renderActiveArchive();
                }
              });
            }
          });
        }
      });
    }
  });

  tutorialScreen.mount(flowRoot);
}

  function goToBriefing() {
    const flowRoot = document.getElementById("opening-flow-root");
    if (!flowRoot) return;

    flowRoot.innerHTML = "";

    const briefingScreen = createOpeningBriefingScreen({
      onComplete: () => {
        briefingScreen.destroy();
        goToTutorial();
      }
    });

    briefingScreen.mount(flowRoot);
  }

  function goToTitle() {
    const flowRoot = document.getElementById("opening-flow-root");
    if (!flowRoot) return;

    if (titleCardAudio) {
      titleCardAudio.pause();
      titleCardAudio.currentTime = 0;
      titleCardAudio.volume = 1;
      titleCardAudio.play().catch(() => {});
    }

    window.setTimeout(() => {
const titleScreen = createOpeningTitleScreen({
  onComplete: () => {
    if (titleCardAudio) {
      titleCardAudio.pause();
      titleCardAudio.currentTime = 0;
    }

    titleScreen.destroy();
    goToBriefing();
  }
});

      titleScreen.mount(flowRoot);
    }, TITLE_BUFFER_MS);
  }

  function goToSponsor() {
    const flowRoot = document.getElementById("opening-flow-root");
    if (!flowRoot) return;

    flowRoot.innerHTML = "";

    window.setTimeout(() => {
      const sponsorScreen = createOpeningSponsorScreen();
      sponsorScreen.mount(flowRoot);

      if (sponsorFireAudio) {
        sponsorFireAudio.pause();
        sponsorFireAudio.currentTime = 0;
        sponsorFireAudio.volume = 0.7;
        sponsorFireAudio.play().catch(() => {});
      }

      window.setTimeout(() => {
        const sponsorRoot = flowRoot.querySelector(".opening-sponsor-screen");
        if (sponsorRoot) {
          sponsorRoot.style.opacity = "0";
        }

        if (sponsorFireAudio) {
          const fadeDuration = SPONSOR_FADE_OUT_MS;
          const fadeSteps = 12;
          const fadeStepTime = fadeDuration / fadeSteps;
          const startingVolume = sponsorFireAudio.volume;
          let currentStep = 0;

          const fadeInterval = window.setInterval(() => {
            currentStep += 1;
            const nextVolume = startingVolume * (1 - currentStep / fadeSteps);

            sponsorFireAudio.volume = Math.max(0, nextVolume);

            if (currentStep >= fadeSteps) {
              window.clearInterval(fadeInterval);
              sponsorFireAudio.pause();
              sponsorFireAudio.currentTime = 0;
              sponsorFireAudio.volume = 0.7;
            }
          }, fadeStepTime);
        }

        window.setTimeout(() => {
          sponsorScreen.destroy();
          flowRoot.innerHTML = "";
          goToTitle();
        }, SPONSOR_FADE_OUT_MS);
      }, SPONSOR_HOLD_MS);
    }, BLACK_BUFFER_MS);
  }

function goToStudio() {
  const flowRoot = document.getElementById("opening-flow-root");
  if (!flowRoot) return;

  flowRoot.innerHTML = "";
  renderOpeningStudioScreen();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flowRoot.classList.remove("is-fading-out");
    });
  });

  playStudioSequence({
      onComplete: () => {
        const studioScreen = document.getElementById("opening-studio-screen");
        if (!studioScreen) {
          goToSponsor();
          return;
        }

        studioScreen.classList.add("is-fading-out");

        window.setTimeout(() => {
          goToSponsor();
        }, STUDIO_FADE_OUT_MS);
      }
    });
  }

  function goToTerminal() {
    renderOpeningTerminalScreen(() => {
      goToStudio();
    });
  }

  function goToStart() {
    renderOpeningStartScreen(() => {
      if (typeof triggerOpeningCrtBurst === "function") {
        triggerOpeningCrtBurst(goToTerminal);
      } else {
        goToTerminal();
      }
    });
  }

  goToStart();
}

/* ========================================
   DEV: START AT STUDIO
======================================== */
if (DEV_START_AT === "studio") {
  const { createOpeningSponsorScreen } = await import("./app/engine/core/opening-sponsor-screen.js");
  const { createOpeningTitleScreen } = await import("./app/engine/core/opening-title-screen.js");
  const sponsorFireAudio = document.getElementById("sponsor-fire-audio");
  const titleCardAudio = document.getElementById("title-card-audio");

  const STUDIO_FADE_OUT_MS = 1200;
  const BLACK_BUFFER_MS = 1000;
  const SPONSOR_HOLD_MS = 5500;
  const SPONSOR_FADE_OUT_MS = 1200;
  const TITLE_BUFFER_MS = 3650;

  renderOpeningStudioScreen();

  playStudioSequence({
    onComplete: () => {
      const flowRoot = document.getElementById("opening-flow-root");
      const studioScreen = document.getElementById("opening-studio-screen");
      if (!flowRoot || !studioScreen) return;

      studioScreen.classList.add("is-fading-out");

window.setTimeout(() => {
  flowRoot.innerHTML = "";

  window.setTimeout(() => {
    const sponsorScreen = createOpeningSponsorScreen();
sponsorScreen.mount(flowRoot);

if (sponsorFireAudio) {
  sponsorFireAudio.pause();
  sponsorFireAudio.currentTime = 0;
  sponsorFireAudio.volume = 0.7;
  sponsorFireAudio.play().catch(() => {});
}

window.setTimeout(() => {
  const sponsorRoot = flowRoot.querySelector(".opening-sponsor-screen");
  if (sponsorRoot) {
    sponsorRoot.style.opacity = "0";
  }

if (sponsorFireAudio) {
  const fadeDuration = SPONSOR_FADE_OUT_MS;
  const fadeSteps = 12;
  const fadeStepTime = fadeDuration / fadeSteps;
  const startingVolume = sponsorFireAudio.volume;
  let currentStep = 0;

  const fadeInterval = window.setInterval(() => {
    currentStep += 1;
    const nextVolume = startingVolume * (1 - currentStep / fadeSteps);

    sponsorFireAudio.volume = Math.max(0, nextVolume);

    if (currentStep >= fadeSteps) {
      window.clearInterval(fadeInterval);
      sponsorFireAudio.pause();
      sponsorFireAudio.currentTime = 0;
      sponsorFireAudio.volume = 0.7;
    }
  }, fadeStepTime);
}

  window.setTimeout(() => {
    sponsorScreen.destroy();
    flowRoot.innerHTML = "";

if (titleCardAudio) {
  titleCardAudio.pause();
  titleCardAudio.currentTime = 0;
  titleCardAudio.volume = 1;
  titleCardAudio.play().catch(() => {});
}

window.setTimeout(() => {
  const titleScreen = createOpeningTitleScreen({
    onComplete: () => {
      // visual pass: stay on title screen for inspection
    }
  });

  titleScreen.mount(flowRoot);
}, TITLE_BUFFER_MS);

  }, SPONSOR_FADE_OUT_MS);
}, SPONSOR_HOLD_MS);
       }, BLACK_BUFFER_MS);
      }, STUDIO_FADE_OUT_MS);
    }
  });
}


/* ========================================
   DEV: START AT TUTORIAL
======================================== */
if (DEV_START_AT === "tutorial") {
  const flowRoot = document.getElementById("opening-flow-root");

  if (flowRoot) {
const tutorialScreen = createOpeningTutorialScreen({
  onComplete: async () => {
    tutorialScreen.destroy();

    const openingFlowScreen = document.getElementById("opening-flow-screen");
    const archiveScreen = document.getElementById("archive-screen");

    if (openingFlowScreen) {
      openingFlowScreen.hidden = true;
      openingFlowScreen.classList.remove("active");
    }

// 1. Prepare archive (not visible yet)
if (archiveScreen) {
  archiveScreen.hidden = false;
  archiveScreen.classList.add("active");
  archiveScreen.classList.remove("is-visible");
  archiveScreen.classList.add("archive-pre-reveal");
}

    // 2. Render archive content first
    await renderActiveArchive();

    // 3. Short cinematic pause
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 4. Fade archive in
    if (archiveScreen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          archiveScreen.classList.add("is-visible");
        });
      });
    }

// 5. Pause after fade
await new Promise((resolve) => setTimeout(resolve, 900));

// 6. Flash locked Mercer portrait
await flashCharacterReveal("mercer");

// 7. Mercer reveal popup
showCharacterSheetModal({
      ...characterSheetData.mercer,
onClose: async () => {
  const mercer = characters.find((character) => character.id === "mercer");

  if (mercer) {
    mercer.locked = false;
  }

  setActiveCharacter("mercer");
  renderCharacterStrip();

  if (archiveScreen) {
    archiveScreen.classList.remove("archive-pre-reveal");
  }

  const pathLabel = document.getElementById("active-path-label");
  const grid = document.getElementById("archive-grid");

  if (pathLabel) {
    pathLabel.textContent = "MERCER'S PATH";
  }

  if (grid) {
    grid.innerHTML = "";
  }

  await new Promise((resolve) => setTimeout(resolve, 450));

  await renderActiveArchive();

  const firstTile = document.querySelector("#archive-grid .archive-tile");
  if (firstTile) {
    firstTile.classList.add("is-revealing");

    window.setTimeout(() => {
      firstTile.classList.remove("is-revealing");
    }, 1600);
  }

  await new Promise((resolve) => setTimeout(resolve, 900));

  showArchiveRulesModal({
    title: "Archive Records",
    body: `
When puzzles are solved, recovered expedition records will be placed here.

Each character’s path will fill as more of the archive is restored.
    `,
    buttonLabel: "Continue",
onClose: async () => {
  await flashBottomNavButton("transmissions");

  const archiveScreen = document.getElementById("archive-screen");
  const transmissionsScreen = document.getElementById("transmissions-screen");
  const hintScreen = document.getElementById("hint-screen");
  const scanScreen = document.getElementById("scan-screen");

  if (archiveScreen) {
    archiveScreen.hidden = true;
    archiveScreen.classList.remove("active");
  }

  if (transmissionsScreen) {
    transmissionsScreen.hidden = false;
    transmissionsScreen.classList.add("active");
  }

  if (hintScreen) {
    hintScreen.hidden = true;
    hintScreen.classList.remove("active");
  }

  if (scanScreen) {
    scanScreen.hidden = true;
    scanScreen.classList.remove("active");
  }

  // Start with empty feed
  refreshTransmissionsScreen([]);

  // Play reveal sequence
  await playSeededTransmissionsSequence();

  // Pause after messages
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Rules popup 2
  showArchiveRulesModal({
    title: "Transmissions",
    body: `
Messages from the expedition team will appear here.

Some transmissions may contain guidance on where to find puzzles in the environment.
    `,
    buttonLabel: "Continue",
onClose: async () => {
  const archiveScreen = document.getElementById("archive-screen");
  const transmissionsScreen = document.getElementById("transmissions-screen");
  const hintScreen = document.getElementById("hint-screen");
  const scanScreen = document.getElementById("scan-screen");

  if (archiveScreen) {
    archiveScreen.hidden = false;
    archiveScreen.classList.add("active");
  }

  if (transmissionsScreen) {
    transmissionsScreen.hidden = true;
    transmissionsScreen.classList.remove("active");
  }

  if (hintScreen) {
    hintScreen.hidden = true;
    hintScreen.classList.remove("active");
  }

  if (scanScreen) {
    scanScreen.hidden = true;
    scanScreen.classList.remove("active");
  }

  setActiveCharacter("mercer");
  renderCharacterStrip();
  await renderActiveArchive();
}
  });
}
  });
}
    });
  }
});

    tutorialScreen.mount(flowRoot);
  }
}

/* ========================================
   DEV: START AT ARCHIVE
======================================== */
if (DEV_START_AT === "archive") {
  const archiveScreen = document.getElementById("archive-screen");
  const openingFlowScreen = document.getElementById("opening-flow-screen");

if (archiveScreen) {
  archiveScreen.hidden = false;
  archiveScreen.classList.add("active");
  archiveScreen.classList.remove("is-visible");

  // ⬇️ ADD THIS
  archiveScreen.classList.add("archive-pre-reveal");
}

  await renderActiveArchive();
}

/* ========================================
   DEBUG LOGGING
======================================== */

  console.log("Onboarding reveal plan:", onboardingRevealPlan);
}

boot().catch((error) => {
  console.error("Boot failed:", error);
});