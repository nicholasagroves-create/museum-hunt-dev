/* ========================================
   OPENING — START SEQUENCE CONTROLLER
======================================== */

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function playStudioSequence({ onComplete } = {}) {
  await wait(50);

  const studioAudio = document.getElementById("studio-bulb-audio");
  const screen = document.getElementById("opening-studio-screen");
  const background = document.getElementById("studio-background");
  const darkness = document.getElementById("studio-darkness");
  const text = document.getElementById("studio-text");

  if (!screen || !background || !darkness || !text || !studioAudio) return;

  studioAudio.pause();
  studioAudio.currentTime = 0;
  studioAudio.volume = 0.45;

  let hasAdvanced = false;

  function advance() {
    if (hasAdvanced) return;
    hasAdvanced = true;

    studioAudio.pause();
    studioAudio.currentTime = 0;

if (typeof onComplete === "function") {
  onComplete();
}
  }

  background.classList.add("is-visible");

  setTimeout(() => {
    studioAudio.play().catch(() => {});
  }, 150);

  setTimeout(() => {
    darkness.style.opacity = "0.78";
  }, 1420);

  setTimeout(() => {
    darkness.style.opacity = "0.58";
  }, 1690);

  setTimeout(() => {
    darkness.style.opacity = "0.72";
  }, 1810);

  setTimeout(() => {
    darkness.style.opacity = "0.35";
  }, 2250);

  setTimeout(() => {
    darkness.style.opacity = "0.10";
  }, 2540);

  setTimeout(() => {
    darkness.style.opacity = "0.16";
  }, 3320);

  setTimeout(() => {
    darkness.style.opacity = "0.08";
  }, 3600);

  setTimeout(() => {
    text.classList.add("is-visible");
  }, 6100);

  screen.addEventListener("click", advance);

  setTimeout(advance, 10000);
}