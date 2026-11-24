import {currentExpedition} from "./dev-activation.js";
import {badgePreview,saveBadge} from "./expedition-badge.js";
export function initializeArchiveBadge(){
 const trigger=document.getElementById("archive-my-badge");
 if(!trigger)return;
 let overlay=null;
 const close=()=>{if(overlay){overlay.remove();overlay=null;trigger.focus();}};
 trigger.addEventListener("click",()=>{
  const account=currentExpedition();
  if(!account){window.alert("No expedition credentials found on this device.");return;}
  if(overlay)return;
  let side="front";
  overlay=document.createElement("div");
  overlay.className="archive-badge-overlay";
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("aria-label","My expedition badge");
  overlay.innerHTML=`<div class="archive-badge-dialog">
    <button type="button" class="archive-badge-close" data-action="close" aria-label="Close badge">✕</button>
    <h2>MY EXPEDITION BADGE</h2>
    <button type="button" class="archive-badge-flip" data-action="flip" aria-label="Flip badge"><img alt="Front of expedition badge"></button>
    <p>Tap badge to flip · Keep your Researcher ID and PIN private.</p>
    <button type="button" class="archive-badge-save" data-action="save">SAVE BADGE</button>
    <p>Both sides download to your phone. Or take a screenshot to save the visible side to Gallery.</p>
    <p class="archive-badge-status" role="status"></p>
  </div>`;
  document.body.appendChild(overlay);
  const img=overlay.querySelector("img");img.src=badgePreview(account,side);
  overlay.querySelector(".archive-badge-close").focus();
  overlay.addEventListener("click",async e=>{
   if(e.target===overlay){close();return;}
   const action=e.target.closest("button")?.dataset.action;
   if(action==="close")close();
   else if(action==="flip"){side=side==="front"?"back":"front";img.src=badgePreview(account,side);img.alt=side==="front"?"Front of expedition badge":"Back of expedition badge with credentials";}
   else if(action==="save"){const status=overlay.querySelector('[role="status"]');try{status.textContent=await saveBadge(account);}catch{status.textContent="Download failed. You can take a screenshot instead.";}}
  });
 });
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&overlay)close();});
}
