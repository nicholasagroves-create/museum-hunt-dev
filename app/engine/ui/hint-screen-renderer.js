export function renderHintScreen(transmission) {
  const container = document.getElementById("hint-screen-content");

  if (!container) return;

  const hintText = transmission?.hint?.text || "";
  const locationId = transmission?.hint?.locationId || "";

  container.innerHTML = `
    <div class="hint-card">
      <div class="hint-map">${locationId}</div>
      <div class="hint-text">${hintText}</div>
    </div>
  `;
}