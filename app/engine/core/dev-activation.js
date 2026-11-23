// Development-only activation. No backend verification or cross-device recovery yet.
const KEY = "museum-hunt-dev-expedition-v1";
const CODE = "TEST-123";
const WORDS = ["RIVER","FOX","ATLAS","NORTH","EMBER","STONE","MAP","GOLD"];
export function currentExpedition() {
  try { const x = JSON.parse(localStorage.getItem(KEY)); return x?.id && x?.password ? x : null; }
  catch { return null; }
}
function randomInt(n) { const bytes = new Uint32Array(1); crypto.getRandomValues(bytes); return bytes[0] % n; }
function createExpedition() {
  const id = "EX-" + Array.from({length: 8},()=> "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[randomInt(32)]).join("");
  const password = WORDS[randomInt(WORDS.length)] + "-" + WORDS[randomInt(WORDS.length)] + "-" + String(100+randomInt(900));
  const session = { id, password, createdAt: new Date().toISOString(), tutorialComplete: false };
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}
export function markTutorialComplete() {
  const x = currentExpedition();
  if (x) { x.tutorialComplete = true; localStorage.setItem(KEY, JSON.stringify(x)); }
}
export function renderDevActivation(root, onActivated) {
  const wrap = document.createElement("div");
  wrap.className = "activation";
  wrap.innerHTML = `<div class="activation__panel">
    <div class="activation__eyebrow">MERCER EXPEDITION · ACCESS TERMINAL</div>
    <h1>EXPEDITION ACCESS</h1>
    <p class="activation__intro">Begin a new expedition or return to your archive.</p>
    <div class="activation__choices">
      <button type="button" data-action="new">NEW EXPEDITION</button>
      <button type="button" data-action="resume">RESUME EXPEDITION</button>
    </div>
    <div class="activation__form" hidden></div>
  </div>`;
  root.replaceChildren(wrap);
  const form = wrap.querySelector(".activation__form");
  const choices = wrap.querySelector(".activation__choices");
  const show = (html) => { choices.hidden = true; form.hidden = false; form.innerHTML = html; };
  wrap.addEventListener("click", async e => {
    const action = e.target.closest("button")?.dataset.action;
    if (action === "new") {
      show(`<label>ACTIVATION CODE<input id="activation-code" autocomplete="off" autocapitalize="characters" placeholder="ABCD-123" maxlength="32"></label><p class="activation__error" role="alert"></p><button data-action="redeem">ACTIVATE EXPEDITION</button><button class="activation__secondary" data-action="back">BACK</button><p class="activation__note">Development access only. Use TEST-123.</p>`);
    } else if (action === "resume") {
      show(`<p class="activation__note">For this development version, recovery is available only on the original device. Cross-device recovery requires the upcoming account server.</p><button data-action="local">OPEN SAVED EXPEDITION</button><button class="activation__secondary" data-action="back">BACK</button>`);
    } else if (action === "back") { form.hidden = true; choices.hidden = false; form.replaceChildren(); }
    else if (action === "local") {
      const x = currentExpedition();
      if (x) onActivated(x, true);
      else show(`<p class="activation__error">No expedition is saved on this device.</p><button data-action="back">BACK</button>`);
    } else if (action === "redeem") {
      const input = form.querySelector("#activation-code");
      if (input.value.trim().toUpperCase() !== CODE) { form.querySelector(".activation__error").textContent = "Code not recognized. Please try again."; return; }
      const x = createExpedition();
      show(`<div class="activation__success">EXPEDITION AUTHORIZED</div><p>Take a screenshot of these credentials for account recovery.</p><div class="activation__credentials"><small>GAME ID</small><strong>${x.id}</strong><small>RECOVERY PASSWORD</small><strong>${x.password}</strong></div><button data-action="copy">COPY CREDENTIALS</button><button data-action="begin">I'VE SAVED MY CREDENTIALS — BEGIN</button><p class="activation__note">This prototype stores credentials only on this device. Screenshot recovery across devices will be enabled when the backend is connected.</p>`);
      form.dataset.id = x.id;
    } else if (action === "copy") {
      const x = currentExpedition();
      if (x) { try { await navigator.clipboard.writeText(`Game ID: ${x.id}\nPassword: ${x.password}`); e.target.textContent = "COPIED"; } catch { e.target.textContent = "PLEASE TAKE A SCREENSHOT"; } }
    } else if (action === "begin") onActivated(currentExpedition(), false);
  });
}
