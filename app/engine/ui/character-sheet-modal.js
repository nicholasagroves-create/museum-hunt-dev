let activeCharacterSheetOverlay = null;

export function showCharacterSheetModal({
  name = "",
  role = "",
  description = "",
  portrait = "",
  onClose
} = {}) {
  hideCharacterSheetModal();

  const overlay = document.createElement("div");
  overlay.className = "character-sheet-modal-overlay";

  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0, 0, 0, 0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: "10020",
    opacity: "0",
    transition: "opacity 320ms ease"
  });

  const card = document.createElement("div");

  Object.assign(card.style, {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "18px",
    overflow: "hidden",
    background: "linear-gradient(180deg, rgba(64,54,42,0.98), rgba(23,20,16,0.98))",
    border: "1px solid rgba(217, 186, 112, 0.35)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
    color: "#f3ead8"
  });

  card.innerHTML = `
    <div style="padding: 18px 18px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); display:flex; gap:14px; align-items:center;">
      <div style="width:72px; height:72px; border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); background:#241c16; flex:0 0 72px;">
        <img src="${portrait}" alt="${name}" style="width:100%; height:100%; object-fit:cover; display:block;" />
      </div>
      <div style="min-width:0;">
        <div style="font-size: 1.25rem; line-height:1.1; color:#e5c57a;">${name}</div>
        <div style="margin-top:6px; font-size:0.78rem; line-height:1.35; color:#cfc0a1; letter-spacing:0.06em; text-transform:uppercase;">${role}</div>
      </div>
    </div>

    <div style="padding: 16px 18px 20px;">
      <div style="font-size: 0.98rem; line-height: 1.55; color: #f3ead8;">${description}</div>

      <button type="button" id="character-sheet-close-button" style="
        margin-top: 18px;
        width: 100%;
        appearance: none;
        border: 1px solid rgba(217, 186, 112, 0.38);
        border-radius: 12px;
        background: rgba(0,0,0,0.28);
        color: #e5c57a;
        padding: 14px 16px;
        font-size: 0.9rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
      ">Continue</button>
    </div>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);
  activeCharacterSheetOverlay = overlay;

  const closeButton = overlay.querySelector("#character-sheet-close-button");

  function closeModal() {
    if (!activeCharacterSheetOverlay) return;

    overlay.style.opacity = "0";

    window.setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }

      if (activeCharacterSheetOverlay === overlay) {
        activeCharacterSheetOverlay = null;
      }

      if (typeof onClose === "function") {
        onClose();
      }
    }, 220);
  }

  closeButton.addEventListener("click", closeModal);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
  });

  return {
    close: closeModal
  };
}

export function hideCharacterSheetModal() {
  if (activeCharacterSheetOverlay && activeCharacterSheetOverlay.parentNode) {
    activeCharacterSheetOverlay.parentNode.removeChild(activeCharacterSheetOverlay);
  }

  activeCharacterSheetOverlay = null;
}