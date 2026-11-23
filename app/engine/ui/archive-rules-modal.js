let activeArchiveRulesOverlay = null;

export function showArchiveRulesModal({
  title = "",
  body = "",
  buttonLabel = "Continue",
  onClose
} = {}) {
  hideArchiveRulesModal();

  const overlay = document.createElement("div");
  overlay.className = "archive-rules-modal-overlay";

  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0, 0, 0, 0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: "10021",
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
    <div style="padding: 18px 18px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);">
      <div style="font-size: 1.1rem; line-height:1.2; color:#e5c57a; letter-spacing:0.06em; text-transform:uppercase;">
        ${title}
      </div>
    </div>

    <div style="padding: 16px 18px 20px;">
      <div style="font-size: 0.98rem; line-height: 1.6; color: #f3ead8;">${body}</div>

      <button type="button" id="archive-rules-close-button" style="
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
      ">${buttonLabel}</button>
    </div>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);
  activeArchiveRulesOverlay = overlay;

  const closeButton = overlay.querySelector("#archive-rules-close-button");

  function closeModal() {
    if (!activeArchiveRulesOverlay) return;

    overlay.style.opacity = "0";

    window.setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }

      if (activeArchiveRulesOverlay === overlay) {
        activeArchiveRulesOverlay = null;
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

export function hideArchiveRulesModal() {
  if (activeArchiveRulesOverlay && activeArchiveRulesOverlay.parentNode) {
    activeArchiveRulesOverlay.parentNode.removeChild(activeArchiveRulesOverlay);
  }

  activeArchiveRulesOverlay = null;
}