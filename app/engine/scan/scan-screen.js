// app/engine/scan/scan-screen.js

const TEST_CODES = {
  "EAST-WING": {
    puzzleId: "east-wing",
    characterId: "megan",
    slotIndex: 0,
    title: "East Wing",
  },
};

export function renderScanScreen({ onSubmitCode }) {
  const screen = document.createElement("section");
  screen.className = "scan-screen";
  screen.innerHTML = `
    <div class="scan-screen__inner">
      <h1 class="scan-screen__title">Scan</h1>
      <p class="scan-screen__text">
        Tap the test QR card to simulate a scan.
      </p>

      <button class="scan-screen__qr-card" type="button">
        <div class="scan-screen__qr-box" aria-hidden="true">
          <div class="scan-screen__qr-pattern"></div>
        </div>
        <div class="scan-screen__qr-label">EAST-WING</div>
      </button>

      <p class="scan-screen__status" aria-live="polite"></p>
    </div>
  `;

  const qrCard = screen.querySelector(".scan-screen__qr-card");
  const status = screen.querySelector(".scan-screen__status");

  qrCard.addEventListener("click", () => {
    const match = TEST_CODES["EAST-WING"];

    if (!match) {
      status.textContent = "Code not recognized.";
      return;
    }

    status.textContent = `"${match.title}" unlocked.`;

    if (typeof onSubmitCode === "function") {
      onSubmitCode(match);
    }
  });

  return screen;
}