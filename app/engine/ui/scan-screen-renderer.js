import { resolveActiveHintTransmissionFromScan } from "../../../main.js";

export function renderScanScreen(transmission) {
  const container = document.getElementById("scan-screen-content");

  if (!container) return;

  const targetPuzzleId = transmission?.targetPuzzleId || "";

  container.innerHTML = `
    <div class="hint-card">
      <div class="hint-map">Scanner Placeholder</div>
      <div class="hint-text">This will become the real scanner. For now, use the button below to simulate a successful scan.</div>
      <button id="simulate-scan-btn" type="button">Simulate Successful Scan</button>
    </div>
  `;

  const simulateButton = document.getElementById("simulate-scan-btn");

  if (simulateButton) {
    simulateButton.addEventListener("click", async () => {
      const resolvedTransmission = resolveActiveHintTransmissionFromScan(targetPuzzleId);
      if (!resolvedTransmission) return;

      const archiveScreen = document.getElementById("archive-screen");
      const transmissionsScreen = document.getElementById("transmissions-screen");
      const hintScreen = document.getElementById("hint-screen");
      const scanScreen = document.getElementById("scan-screen");

      archiveScreen.hidden = true;
      archiveScreen.classList.remove("active");

      hintScreen.hidden = true;
      hintScreen.classList.remove("active");

      scanScreen.hidden = true;
      scanScreen.classList.remove("active");

      transmissionsScreen.hidden = false;
      transmissionsScreen.classList.add("active");

      document.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === "transmissions");
      });

      const { renderTransmissions } = await import("./transmissions-renderer.js");
      renderTransmissions(
        window.__museumHuntTransmissions || []
      );
    });
  }
}