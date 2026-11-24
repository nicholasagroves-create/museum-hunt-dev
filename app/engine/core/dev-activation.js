import { badgePreview, saveBadge } from "./expedition-badge.js";
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
      show(`<div class="activation__success">EXPEDITION AUTHORIZED</div>
        <p>Your official expedition badge is ready. Flip it to see your login credentials.</p>
        <button type="button" class="activation__badge-flip" data-action="flip" aria-label="Flip expedition badge">
          <img class="activation__badge-image" alt="Front of expedition badge" />
        </button>
        <p class="activation__note">TAP BADGE TO FLIP</p>
        <button data-action="save">SAVE BADGE</button><p class="activation__note">Saves both sides to Downloads. Prefer your photo gallery? Take a screenshot using your phone’s screenshot buttons.</p>
        <p class="activation__error" role="status"></p>
        <button data-action="begin">I'VE SAVED MY BADGE — BEGIN</button>
        <p class="activation__note">This test version remembers your account on this device. Cross-device recovery requires the future account server.</p>`);
      form.dataset.side = "front";
      const img = form.querySelector(".activation__badge-image");
      img.src = badgePreview(x,"front");
      form.dataset.id = x.id;
    } else if (action === "flip") {
      const x=currentExpedition();
      if(!x)return;
      form.dataset.side=form.dataset.side==="front"?"back":"front";
      const img=form.querySelector(".activation__badge-image");
      img.src=badgePreview(x,form.dataset.side);
      img.alt=form.dataset.side==="front"?"Front of expedition badge":"Back of expedition badge with Researcher ID and PIN";
    } else if (action === "save") {
      const x=currentExpedition();
      if(!x)return;
      const status=form.querySelector('[role="status"]');
      try {status.textContent=await saveBadge(x,e.target);}
      catch(err){status.textContent="Unable to save automatically. Use your phone screenshot controls instead.";}
    } else if (action === "begin") onActivated(currentExpedition(), false);
  });
}

export function renderBadgeTest(root) {
  const account=currentExpedition();
  if(!account){renderDevActivation(root,()=>location.reload());return;}
  const wrap=document.createElement("div");
  wrap.className="activation";
  wrap.innerHTML=`<div class="activation__panel"><div class="activation__eyebrow">DEVELOPMENT · BADGE PREVIEW</div><h1>YOUR EXPEDITION BADGE</h1><p class="activation__intro">Tap to flip. This is your existing account.</p><button type="button" class="activation__badge-flip" data-action="flip"><img class="activation__badge-image" alt="Expedition badge front"></button><p class="activation__note">Tap badge to flip · Screenshot using Power + Volume Down</p><button data-action="save">SAVE BADGE</button><p class="activation__note">Saves both sides to Downloads. Or take a screenshot to keep the visible side in Gallery.</p><p class="activation__error" role="status"></p><button data-action="archive">RETURN TO ARCHIVE</button></div>`;
  root.replaceChildren(wrap);
  let side="front";
  const img=wrap.querySelector("img");img.src=badgePreview(account,side);
  wrap.addEventListener("click",async e=>{
    const action=e.target.closest("button")?.dataset.action;
    if(action==="flip"){side=side==="front"?"back":"front";img.src=badgePreview(account,side);img.alt="Expedition badge "+side;}
    if(action==="save"){const status=wrap.querySelector('[role="status"]');try{status.textContent=await saveBadge(account,e.target);}catch{status.textContent="Download failed. Please take a screenshot instead.";}}
    if(action==="archive"){location.href=location.pathname;}
  });
}
