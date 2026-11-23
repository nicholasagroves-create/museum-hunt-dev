let isMuted = false;
const listeners = new Set();

function syncAllMediaElements() {
  const mediaElements = document.querySelectorAll("audio, video");

  mediaElements.forEach((element) => {
    element.muted = isMuted;
  });
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener(isMuted);
    } catch (error) {
      console.error("Mute listener failed:", error);
    }
  });
}

export function getGlobalMuteState() {
  return isMuted;
}

export function setGlobalMuteState(nextMuted) {
  isMuted = Boolean(nextMuted);
  syncAllMediaElements();
  notifyListeners();
}

export function toggleGlobalMuteState() {
  setGlobalMuteState(!isMuted);
  return isMuted;
}

export function subscribeToGlobalMuteState(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function syncMediaElementToGlobalMute(mediaElement) {
  if (!mediaElement) return;
  mediaElement.muted = isMuted;
}

export function initializeGlobalAudioController() {
  syncAllMediaElements();
}