/* ========================================
   OPENING — STUDIO SCREEN
======================================== */

export function renderOpeningStudioScreen() {
  const root = document.getElementById("opening-flow-root");

  if (!root) return;

  root.innerHTML = `
    <main class="opening-studio-screen" id="opening-studio-screen">
      <div class="studio-background" id="studio-background"></div>
      <div class="studio-darkness" id="studio-darkness"></div>
      <div class="studio-gradient"></div>

      <div class="studio-text" id="studio-text">
        <div class="studio-title">SPORCLE EXPERIENCES</div>
        <div class="studio-subtitle">presents</div>
      </div>
    </main>
  `;
}