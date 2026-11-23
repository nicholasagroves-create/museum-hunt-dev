// Development-only activation. No backend verification or cross-device recovery yet.
const KEY = "museum-hunt-dev-expedition-v2";
const CODE = "TEST-123"; // Temporary shared testing code; future codes are administrator-defined.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function formatGameId(value) { const raw = value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,7); return raw.length > 4 ? raw.slice(0,4)+"-"+raw.slice(4) : raw; }
export function formatActivationCode(value) { return value.trim().replace(/[^A-Za-z0-9-]/g,"").slice(0,40).toUpperCase(); }
export function currentExpedition() {
  try { const x = JSON.parse(localStorage.getItem(KEY)); return x?.id && /^\d{4}$/.test(x?.pin) ? x : null; }
  catch { return null; }
}
function randomInt(n) { const bytes = new Uint32Array(1); crypto.getRandomValues(bytes); return bytes[0] % n; }
function createExpedition() {
  const id = formatGameId(Array.from({length: 7},()=> ALPHABET[randomInt(ALPHABET.length)]).join(""));
  const pin = String(randomInt(10000)).padStart(4,"0");
  const session = { id, pin, createdAt: new Date().toISOString(), tutorialComplete: false };
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
  wrap.addEventListener("input", e => { if (e.target.id === "activation-code") e.target.value = formatActivationCode(e.target.value); });
  wrap.addEventListener("click", async e => {
    const action = e.target.closest("button")?.dataset.action;
    if (action === "new") {
      show(`<label>ACTIVATION CODE<input id="activation-code" autocomplete="off" autocapitalize="characters" placeholder="ABCD-123" maxlength="40" inputmode="text"></label><p class="activation__error" role="alert"></p><button data-action="redeem">ACTIVATE EXPEDITION</button><button class="activation__secondary" data-action="back">BACK</button><p class="activation__note">Development access only. Use TEST-123.</p>`);
    } else if (action === "resume") {
      show(`<p class="activation__note">For this development version, recovery is available only on the original device. Cross-device recovery requires the upcoming account server.</p><button data-action="local">OPEN SAVED EXPEDITION</button><button class="activation__secondary" data-action="back">BACK</button>`);
    } else if (action === "back") { form.hidden = true; choices.hidden = false; form.replaceChildren(); }
    else if (action === "local") {
      const x = currentExpedition();
      if (x) onActivated(x, true);
      else show(`<p class="activation__error">No expedition is saved on this device.</p><button data-action="back">BACK</button>`);
    } else if (action === "redeem") {
      const input = form.querySelector("#activation-code");
      if (formatActivationCode(input.value) !== CODE) { form.querySelector(".activation__error").textContent = "Code not recognized. Please try again."; return; }
      const x = createExpedition();
      show(`<div class="activation__success">EXPEDITION AUTHORIZED</div><p>Save these credentials to recover your expedition later.</p><div class="activation__credentials"><small>GAME ID</small><strong>${x.id}</strong><small>4-DIGIT PIN</small><strong>${x.pin}</strong></div><button data-action="save">SAVE CREDENTIAL CARD</button><button data-action="begin">I'VE SAVED MY CREDENTIALS — BEGIN</button><p class="activation__note">This prototype stores credentials only on this device. Cross-device recovery will be enabled when the backend is connected.</p>`);
      form.dataset.id = x.id;
    } else if (action === "save") {
      const x = currentExpedition();
      if (!x) return;
      const canvas = document.createElement("canvas");
      canvas.width = 1080; canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#101b16"; ctx.fillRect(0,0,1080,1350);
      ctx.strokeStyle = "#bda46b"; ctx.lineWidth = 8; ctx.strokeRect(55,55,970,1240);
      ctx.textAlign = "center";
      ctx.fillStyle = "#d5b976"; ctx.font = "bold 54px Georgia"; ctx.fillText("MERCER EXPEDITION",540,220);
      ctx.fillStyle = "#a8bca5"; ctx.font = "34px monospace"; ctx.fillText("YOUR EXPEDITION CREDENTIALS",540,310);
      ctx.fillText("RESEARCHER ID",540,495);
      ctx.fillStyle = "#fff1cc"; ctx.font = "bold 98px monospace"; ctx.fillText(x.id,540,610);
      ctx.fillStyle = "#a8bca5"; ctx.font = "34px monospace"; ctx.fillText("4-DIGIT PIN",540,780);
      ctx.fillStyle = "#fff1cc"; ctx.font = "bold 112px monospace"; ctx.fillText(x.pin,540,905);
      ctx.fillStyle = "#a8bca5"; ctx.font = "30px sans-serif"; ctx.fillText("Keep this image to recover your expedition.",540,1090);
      canvas.toBlob(async blob => {
        if (!blob) { e.target.textContent = "USE YOUR PHONE SCREENSHOT BUTTONS"; return; }
        const file = new File([blob], "mercer-expedition-credentials.png", {type:"image/png"});
        try {
          if (navigator.canShare?.({files:[file]})) { await navigator.share({files:[file],title:"Expedition Credentials"}); e.target.textContent = "CARD SENT TO SHARE MENU"; return; }
        } catch (err) { if (err.name === "AbortError") return; }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a"); link.href=url; link.download=file.name; document.body.appendChild(link); link.click(); link.remove();
        e.target.textContent = "CARD DOWNLOAD REQUESTED — CHECK DOWNLOADS";
        setTimeout(()=>URL.revokeObjectURL(url),60000);
      }, "image/png");
    } else if (action === "begin") onActivated(currentExpedition(), false);
  });
}
