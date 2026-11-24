// Museum-specific credential artwork. Both sides are drawn from the same
// account data; no login secrets are embedded in a QR code.
const W=600,H=930;
function card(ctx, ox, paper=false) {
  const g=ctx.createLinearGradient(ox,0,ox+W,H);
  if(paper){g.addColorStop(0,"#e5d0a0");g.addColorStop(.55,"#d0b47e");g.addColorStop(1,"#ac8855");}
  else {g.addColorStop(0,"#30221a");g.addColorStop(.5,"#10261e");g.addColorStop(1,"#21170f");}
  ctx.fillStyle=g;ctx.fillRect(ox,0,W,H);
  ctx.strokeStyle="#c49c51";ctx.lineWidth=10;ctx.strokeRect(ox+15,15,W-30,H-30);
  ctx.strokeStyle=paper?"#6b4b27":"#806336";ctx.lineWidth=2;ctx.strokeRect(ox+29,29,W-58,H-58);
  for(let i=0;i<240;i++){const x=ox+35+(i*173%530),y=35+(i*317%860);ctx.fillStyle=paper?"#79572a15":"#d2b57613";ctx.fillRect(x,y,2+(i%4),2+(i%3));}
  ctx.textAlign="center";
  for(const x of [ox+48,ox+W-48])for(const y of [48,H-48]){
    ctx.beginPath();ctx.arc(x,y,15,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-21,y);ctx.lineTo(x+21,y);ctx.moveTo(x,y-21);ctx.lineTo(x,y+21);ctx.stroke();
  }
}
function txt(ctx,t,x,y,size,color="#ead7a3",font="Georgia",weight="normal"){
  ctx.fillStyle=color;ctx.font=weight+" "+size+"px "+font;ctx.textAlign="center";ctx.fillText(t,x,y);
}
function compass(ctx,cx,cy,r){
  ctx.strokeStyle="#d3ae64";ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,r*.78,0,Math.PI*2);ctx.stroke();
  for(let a=0;a<16;a++){const t=a*Math.PI/8;ctx.beginPath();ctx.moveTo(cx+Math.cos(t)*r*.85,cy+Math.sin(t)*r*.85);ctx.lineTo(cx+Math.cos(t)*r,cy+Math.sin(t)*r);ctx.stroke();}
  ctx.fillStyle="#e8ca80";ctx.beginPath();ctx.moveTo(cx,cy-r*.75);ctx.lineTo(cx+17,cy+13);ctx.lineTo(cx,cy);ctx.lineTo(cx-17,cy+13);ctx.closePath();ctx.fill();
  ctx.fillStyle="#6e2c1b";ctx.beginPath();ctx.moveTo(cx,cy+r*.75);ctx.lineTo(cx+17,cy-13);ctx.lineTo(cx,cy);ctx.lineTo(cx-17,cy-13);ctx.closePath();ctx.fill();
}
function front(ctx,x){
  card(ctx,x);
  txt(ctx,"NATIONAL GEOGRAPHIC",x+300,104,31,"#f1dbab","Georgia","bold");
  txt(ctx,"MUSEUM EXPEDITION",x+300,146,23,"#c1a773");
  ctx.strokeStyle="#bc9756";ctx.beginPath();ctx.moveTo(x+85,166);ctx.lineTo(x+515,166);ctx.stroke();
  compass(ctx,x+300,390,150);
  txt(ctx,"THE MERCER",x+300,626,53,"#f1d38c","Georgia","bold");
  txt(ctx,"EXPEDITION",x+300,686,55,"#f1d38c","Georgia","bold");
  ctx.fillStyle="#d9c28e";ctx.fillRect(x+67,741,466,92);
  txt(ctx,"AUTHORIZED EXPLORER",x+300,796,31,"#33271c","Georgia","bold");
  txt(ctx,"RESEARCHER FIELD CREDENTIAL",x+300,871,18,"#c6a66c");
}
function back(ctx,x,account){
  card(ctx,x,true);
  txt(ctx,"EXPEDITION ARCHIVE",x+300,105,36,"#38271b","Georgia","bold");
  txt(ctx,"AUTHORIZED RESEARCHER",x+300,145,20,"#644829");
  compass(ctx,x+300,270,77);
  ctx.strokeStyle="#6c4c29";ctx.beginPath();ctx.moveTo(x+80,383);ctx.lineTo(x+520,383);ctx.stroke();
  txt(ctx,"RESEARCHER IDENTIFICATION",x+300,440,22,"#644829");
  ctx.fillStyle="#f1dfb9";ctx.fillRect(x+70,470,460,102);
  txt(ctx,account.id,x+300,540,64,"#2b211a","monospace","bold");
  txt(ctx,"ACCESS PIN",x+300,639,23,"#644829");
  ctx.fillStyle="#f1dfb9";ctx.fillRect(x+165,665,270,94);
  txt(ctx,account.pin,x+300,730,66,"#2b211a","monospace","bold");
  txt(ctx,"RETAIN FOR EXPEDITION RECOVERY",x+300,827,19,"#644829");
  txt(ctx,"DO NOT SHARE YOUR ACCESS PIN",x+300,858,16,"#644829");
}
export function makeBadgeCanvas(account,side="both"){
  const canvas=document.createElement("canvas");
  canvas.width=side==="both"?W*2:W;canvas.height=H;
  const ctx=canvas.getContext("2d");
  if(side==="front")front(ctx,0);
  else if(side==="back")back(ctx,0,account);
  else {front(ctx,0);back(ctx,W,account);}
  return canvas;
}
export function badgePreview(account,side){return makeBadgeCanvas(account,side).toDataURL("image/png");}
export async function saveBadge(account,button){
  const canvas=makeBadgeCanvas(account);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
  if(!blob)throw new Error("Could not create badge image");
  const file=new File([blob],"mercer-expedition-badge.png",{type:"image/png"});
  const url=URL.createObjectURL(blob),link=document.createElement("a");
  link.href=url;link.download=file.name;document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  return "Badge saved to Downloads (or check your browser downloads).";
}
