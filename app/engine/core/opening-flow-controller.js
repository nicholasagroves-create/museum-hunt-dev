import { renderOpeningStartScreen } from "./opening-start-screen.js";
import { renderOpeningTerminalScreen } from "./opening-terminal-screen.js";
import { renderOpeningStudioScreen } from "./opening-studio-screen.js";
import { createOpeningSponsorScreen } from "./opening-sponsor-screen.js";
import { createOpeningTitleScreen } from "./opening-title-screen.js";
import { createOpeningBriefingScreen } from "./opening-briefing-screen.js";
import { createOpeningTutorialScreen } from "./opening-tutorial-screen.js";

const SPONSOR_HOLD_MS = 2200;

export function renderOpeningFlowShell() {
  return `
    <section
      id="opening-flow-screen"
      class="screen active"
      style="
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: #000000;
        z-index: 9998;
        overflow: hidden;
      "
    >
      <div
        id="opening-flow-root"
        style="
          position: relative;
          width: 100%;
          height: 100%;
          background: #000000;
          overflow: hidden;
        "
      ></div>
    </section>
  `;
}

export function startOpeningFlow({ triggerOpeningCrtBurst, onComplete } = {}) {
  function goToStart() {
    renderOpeningStartScreen(() => {
      if (typeof triggerOpeningCrtBurst === "function") {
        triggerOpeningCrtBurst(goToTerminal);
      } else {
        goToTerminal();
      }
    });
  }

  function goToTerminal() {
    renderOpeningTerminalScreen(() => {
      goToStudio();
    });
  }

function goToStudio() {
  const flowRoot = document.getElementById("opening-flow-root");
  if (!flowRoot) return;

  flowRoot.innerHTML = "";

  renderOpeningStudioScreen();

import("./start-sequence-controller.js").then(({ playStudioSequence }) => {
  playStudioSequence({
    onComplete: () => {
      const studioScreen = document.getElementById("opening-studio-screen");
      if (!studioScreen) {
        goToSponsor();
        return;
      }

      const sponsorScreen = createOpeningSponsorScreen();
      sponsorScreen.mount(flowRoot);

      studioScreen.classList.add("is-fading-out");

      window.setTimeout(() => {
        sponsorScreen.destroy();
        flowRoot.innerHTML = "";
        goToSponsor();
      }, 1200);
    }
  });
});

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flowRoot.classList.remove("is-fading-out");
    });
  });
}

  function goToSponsor() {
    const flowRoot = document.getElementById("opening-flow-root");
    if (!flowRoot) return;

    flowRoot.innerHTML = "";

const sponsorScreen = createOpeningSponsorScreen();

sponsorScreen.mount(flowRoot);

window.setTimeout(() => {
  sponsorScreen.destroy();
  flowRoot.innerHTML = "";
  goToTitle();
}, SPONSOR_HOLD_MS);
  }

  function goToTitle() {
    const flowRoot = document.getElementById("opening-flow-root");
    if (!flowRoot) return;

    flowRoot.innerHTML = "";

    const titleScreen = createOpeningTitleScreen({
      onComplete: () => {
        titleScreen.destroy();
        flowRoot.innerHTML = "";
        goToBriefing();
      }
    });

    titleScreen.mount(flowRoot);
  }

  function goToBriefing() {
    const flowRoot = document.getElementById("opening-flow-root");
    if (!flowRoot) return;

    flowRoot.innerHTML = "";

    const briefingScreen = createOpeningBriefingScreen({
      onComplete: () => {
        briefingScreen.destroy();
        flowRoot.innerHTML = "";
        goToTutorial();
      }
    });

    briefingScreen.mount(flowRoot);
  }

  function goToTutorial() {
    const flowRoot = document.getElementById("opening-flow-root");
    if (!flowRoot) return;

    flowRoot.innerHTML = "";

    const tutorialScreen = createOpeningTutorialScreen({
      onComplete: () => {
        tutorialScreen.destroy();
        flowRoot.innerHTML = "";

        if (typeof onComplete === "function") {
          onComplete();
        }
      }
    });

    tutorialScreen.mount(flowRoot);
  }

  goToStart();
}