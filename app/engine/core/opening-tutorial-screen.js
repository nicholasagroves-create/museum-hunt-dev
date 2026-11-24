export function createOpeningTutorialScreen({onComplete}={}) {
 let frame=null,finished=false;
 function receive(event){
  if(finished||!frame||event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.type!=="museum-hunt-tutorial-complete")return;
  finished=true;
  onComplete?.();
 }
 function mount(container){
  if(!container)return null;
  frame=document.createElement("iframe");
  frame.title="Mercer orientation — Archive Credential Cylinder";
  frame.src=new URL("../tutorial/cryptex/index.html",import.meta.url).href;
  frame.allow="autoplay";
  Object.assign(frame.style,{position:"fixed",inset:"0",width:"100%",height:"100dvh",border:"0",background:"#000",zIndex:"9999"});
  window.addEventListener("message",receive);
  container.appendChild(frame);
  return frame;
 }
 function destroy(){finished=true;window.removeEventListener("message",receive);frame?.remove();frame=null;}
 return {mount,destroy};
}
