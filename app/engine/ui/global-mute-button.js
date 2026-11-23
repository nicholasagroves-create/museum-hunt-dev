import {
  getGlobalMuteState,
  toggleGlobalMuteState,
  subscribeToGlobalMuteState
} from "../core/global-audio-controller.js";

let muteButtonEl = null;
let unsubscribe = null;

function getButtonLabel(isMuted) {
  return isMuted ? "Unmute audio" : "Mute audio";
}

function getButtonIcon(isMuted) {
  return isMuted ? "🔇" : "🔊";
}

function updateButton() {
  if (!muteButtonEl) return;

  const isMuted = getGlobalMuteState();

  muteButtonEl.setAttribute("aria-label", getButtonLabel(isMuted));
  muteButtonEl.setAttribute("title", getButtonLabel(isMuted));
  muteButtonEl.textContent = getButtonIcon(isMuted);
  muteButtonEl.classList.toggle("is-muted", isMuted);
}

export function mountGlobalMuteButton() {
  if (muteButtonEl) {
    updateButton();
    return muteButtonEl;
  }

  muteButtonEl = document.createElement("button");
  muteButtonEl.type = "button";
  muteButtonEl.id = "global-mute-button";
  muteButtonEl.className = "global-mute-button";
  muteButtonEl.setAttribute("aria-label", getButtonLabel(getGlobalMuteState()));
  muteButtonEl.setAttribute("title", getButtonLabel(getGlobalMuteState()));

  Object.assign(muteButtonEl.style, {
    position: "fixed",
    top: "calc(14px + env(safe-area-inset-top, 0px))",
    right: "14px",
    width: "44px",
    height: "44px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(0, 0, 0, 0.32)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    lineHeight: "1",
    cursor: "pointer",
    zIndex: "10000",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.28)"
  });

  muteButtonEl.addEventListener("click", () => {
    toggleGlobalMuteState();
    updateButton();
  });

  document.body.appendChild(muteButtonEl);

  unsubscribe = subscribeToGlobalMuteState(() => {
    updateButton();
  });

  updateButton();

  return muteButtonEl;
}

export function unmountGlobalMuteButton() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  if (muteButtonEl && muteButtonEl.parentNode) {
    muteButtonEl.parentNode.removeChild(muteButtonEl);
  }

  muteButtonEl = null;
}