
/* ================= ficha técnica: one Instagram-sized image with the whole order, to send by DM ================= */
const FICHA_W=1080,FICHA_H=1350;
const fichaFonts=()=>Promise.all(['400 60px "Bodoni Moda"','italic 400 60px "Bodoni Moda"','400 40px "Caveat Brush"','600 20px Figtree','700 20px Figtree'].map(f=>document.fonts?.load?.(f).catch(()=>0))).catch(()=>0);
function fichaSwatch(ctx,x,y,r,c){ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);
  if(c===TORNASOL&&ctx.createConicGradient){const g=ctx.createConicGradient(0,x,y);[['#ffd6ec',0],['#d6ecff',.25],['#dcffe6',.5],['#fff4c6',.75],['#ffd6ec',1]].forEach(([k,p])=>g.addColorStop(p,k));ctx.fillStyle=g}else ctx.fillStyle=c;
  ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowBlur=6;ctx.shadowOffsetY=2;ctx.fill();ctx.shadowColor='transparent';ctx.lineWidth=4;ctx.strokeStyle='#fff';ctx.stroke();ctx.restore()}
function fichaStar(ctx,x,y,r,c){ctx.save();ctx.fillStyle=c;ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,rad=i%2?r*.32:r;ctx.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad)}ctx.closePath();ctx.fill();ctx.restore()}
function fitText(ctx,t,max){let s=t;while(ctx.measureText(s).width>max&&s.length>1)s=s.slice(0,-2)+'…';return s}
async function renderFicha(){await fichaFonts();const code=orderCode(),a=orderAgenda(),[W,H]=dims(a),rows=orderRows();
  const c=document.createElement('canvas');c.width=FICHA_W;c.height=FICHA_H;const ctx=c.getContext('2d');ctx.__s=1;
  const G='#386660',CR='#F3EEE6',Y='#F6E08A',P='#EDB8B7',GO='#E0B04A',WI='#7F3A3C',INK='#22403B',serif='"Bodoni Moda",Georgia,serif',hand='"Caveat Brush","Comic Sans MS",cursive',sans='Figtree,system-ui,sans-serif';
  ctx.fillStyle=G;ctx.fillRect(0,0,FICHA_W,FICHA_H);
  ctx.strokeStyle=GO;ctx.lineWidth=4;rr(ctx,26,26,FICHA_W-52,FICHA_H-52,30);ctx.stroke();ctx.globalAlpha=.5;ctx.lineWidth=2;rr(ctx,40,40,FICHA_W-80,FICHA_H-80,22);ctx.stroke();ctx.globalAlpha=1;
  [[96,96,18,Y],[990,120,14,P],[930,560,10,Y],[80,700,12,P],[1000,1040,16,Y],[120,1160,10,GO],[540,300,9,P]].forEach(([x,y,r,k])=>fichaStar(ctx,x,y,r,k));
  /* header */
  const logo=await loadImg(BRAND.logo);if(logo){const lw=310,lh=lw*logo.naturalHeight/logo.naturalWidth;ctx.drawImage(logo,(FICHA_W-lw)/2,64,lw,lh)}
  ctx.textAlign='center';ctx.fillStyle=Y;ctx.font=`700 22px ${sans}`;ctx.letterSpacing='6px';ctx.fillText('FICHA TÉCNICA DEL PEDIDO',FICHA_W/2,232);ctx.letterSpacing='0px';
  const d=ORD.date||new Date();ctx.fillStyle=CR;ctx.font=`400 26px ${serif}`;ctx.fillText(`N.º ${code}  ·  ${d.toLocaleDateString('es-GT',{day:'numeric',month:'long',year:'numeric'})}`,FICHA_W/2,276);
  /* the notebook, at its real proportion (A6 is drawn smaller than A5) */
  const top=330,maxH=600,ch=maxH*H/794,cw=ch*W/H,cx=96+(400-cw)/2,cy=top+(maxH-ch)/2+10;
  ctx.save();ctx.translate(cx,cy);ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=36;ctx.shadowOffsetY=18;ctx.fillStyle='#000';ctx.fillRect(4,4,cw-8,ch-8);ctx.restore();
  ctx.save();ctx.translate(cx,cy);ctx.scale(cw/W,ch/H);ctx.__s=cw/W;await renderCover(ctx,a,W,H);ctx.restore();ctx.__s=1;
  ctx.fillStyle=Y;ctx.font=`400 30px ${hand}`;ctx.fillText(dlPick(DL_SIZES,ORD.size)[3],96+200,cy+ch+52);
  /* specs card */
  const kx=540,ky=top,kw=448,kh=640;ctx.save();ctx.shadowColor='rgba(0,0,0,.35)';ctx.shadowBlur=30;ctx.shadowOffsetY=14;ctx.fillStyle=CR;rr(ctx,kx,ky,kw,kh,22);ctx.fill();ctx.restore();
  ctx.textAlign='left';ctx.fillStyle=WI;ctx.font=`700 18px ${sans}`;ctx.letterSpacing='5px';ctx.fillText('TU DELULU',kx+34,ky+52);ctx.letterSpacing='0px';
  const sw={1:null,2:dlPick(DL_LEATHERS,ORD.leather)[2],3:dlPick(DL_ELASTICS,ORD.elastic)[2]},rowH=(kh-90-118)/rows.length;
  const charmImg=ORD.charm!=='none'&&CHARM_PHOTOS[ORD.charm]?await loadImg(CHARM_PHOTOS[ORD.charm].src):null;
  for(let i=0;i<rows.length;i++){const[k,v,stp]=rows[i],y=ky+80+i*rowH;
    if(i){ctx.save();ctx.strokeStyle='rgba(34,64,59,.18)';ctx.setLineDash([6,6]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(kx+34,y);ctx.lineTo(kx+kw-34,y);ctx.stroke();ctx.restore()}
    ctx.fillStyle=WI;ctx.font=`700 15px ${sans}`;ctx.letterSpacing='3px';ctx.fillText(k.toUpperCase(),kx+34,y+36);ctx.letterSpacing='0px';
    const hasIcon=(i===1||i===2)||(i===3&&charmImg);ctx.fillStyle=INK;ctx.font=`400 34px ${serif}`;ctx.fillText(fitText(ctx,v,kw-68-(hasIcon?70:0)),kx+34,y+80);
    if(i===1||i===2)fichaSwatch(ctx,kx+kw-62,y+rowH/2,24,sw[i+1]);
    if(i===3&&charmImg){const k=Math.min(64/charmImg.naturalWidth,64/charmImg.naturalHeight),w=charmImg.naturalWidth*k,h=charmImg.naturalHeight*k;ctx.drawImage(charmImg,kx+kw-62-w/2,y+rowH/2-h/2,w,h)}}
  /* price */
  const py=ky+kh-118;ctx.fillStyle=G;rr(ctx,kx+20,py,kw-40,98,16);ctx.fill();
  ctx.fillStyle=Y;ctx.font=`700 15px ${sans}`;ctx.letterSpacing='3px';ctx.fillText('TOTAL',kx+44,py+40);ctx.letterSpacing='0px';
  ctx.fillStyle=CR;ctx.globalAlpha=.85;ctx.font=`500 17px ${sans}`;ctx.fillText(`Libreta ${qz(orderPrice())} + envío ${qz(DL_SHIP)}`,kx+44,py+70);ctx.globalAlpha=1;
  ctx.textAlign='right';ctx.fillStyle=Y;ctx.font=`400 50px ${serif}`;ctx.fillText(qz(orderTotal()),kx+kw-44,py+67);ctx.textAlign='left';
  /* datos de entrega */
  const dy=1010;ctx.save();ctx.strokeStyle='rgba(246,224,138,.55)';ctx.setLineDash([8,7]);ctx.lineWidth=2;rr(ctx,96,dy,FICHA_W-192,118,18);ctx.stroke();ctx.restore();
  ctx.textAlign='left';ctx.fillStyle=Y;ctx.font=`700 15px ${sans}`;ctx.letterSpacing='4px';ctx.fillText('DATOS DE ENTREGA',124,dy+36);ctx.letterSpacing='0px';
  const sh=ORD.ship||{},val=v=>(v||'').trim()||'—';
  ctx.fillStyle=CR;ctx.font=`500 24px ${sans}`;ctx.fillText(fitText(ctx,val(sh.name),520),124,dy+72);
  ctx.textAlign='right';ctx.fillText('☎ '+val(sh.phone),FICHA_W-124,dy+72);ctx.textAlign='left';
  ctx.globalAlpha=.85;ctx.font=`400 20px ${sans}`;ctx.fillText(fitText(ctx,val(sh.addr).replace(/\s+/g,' '),FICHA_W-248),124,dy+102);ctx.globalAlpha=1;ctx.textAlign='center';
  const pill='PEDIDOS POR DM → @'+BRAND.ig.toUpperCase();ctx.font=`700 26px ${sans}`;ctx.letterSpacing='4px';const pw=ctx.measureText(pill).width+80;
  ctx.fillStyle=Y;rr(ctx,(FICHA_W-pw)/2,1150,pw,70,35);ctx.fill();ctx.fillStyle=INK;ctx.fillText(pill,FICHA_W/2,1195);ctx.letterSpacing='0px';
  ctx.fillStyle=CR;ctx.globalAlpha=.75;ctx.font=`600 20px ${sans}`;ctx.fillText(BRAND.site.replace('https://',''),FICHA_W/2,1266);ctx.globalAlpha=1;
  return c}
const fichaBlob=c=>new Promise(r=>c.toBlob(r,'image/png'));
async function saveFicha(){const blob=await fichaBlob(await renderFicha());return offerFile(`ficha-${orderCode()}.png`,blob)}
async function openFicha(){const txt=orderText(),name=`ficha-${orderCode()}.png`;
  const m=modal(`<header><h2>Tu ficha técnica</h2><div class="spacer"></div><button class="btn ghost icon" data-x aria-label="Cerrar">${ico('x')}</button></header>
   <div class="content one ficha"><div class="ficha-img"><span class="hint">Armando tu ficha…</span></div>
    <ol class="ficha-steps"><li><b>Guardá tu ficha</b> <span class="hint">(o compartila directo a Instagram)</span></li><li><b>Abrí el DM</b> de @${BRAND.ig}, pegá tu pedido (ya lo copiamos) y adjuntá la ficha.</li></ol></div>
   <footer><button class="btn" data-save disabled>${ico('dl')}Guardar ficha</button><button class="btn" data-share hidden>${ico('share')}Compartir</button><div class="spacer"></div><a class="btn primary" data-dm href="${BRAND.dm}" target="_blank" rel="noopener">Abrir el DM →</a></footer>`,'ficha-dlg');
  let blob=null,file=null;
  try{const c=await renderFicha();blob=await fichaBlob(c);file=new File([blob],name,{type:'image/png'});
    const url=URL.createObjectURL(blob);$('.ficha-img',m).innerHTML=`<img src="${url}" alt="Ficha técnica del pedido ${esc(ORD.code)}">`;$('[data-save]',m).disabled=false;
    if(navigator.canShare?.({files:[file]}))$('[data-share]',m).hidden=false}
  catch(e){$('.ficha-img',m).innerHTML='<span class="hint">No se pudo armar la imagen. Igual podés copiar tu pedido y mandarlo por DM.</span>'}
  const copy=async()=>{try{await navigator.clipboard.writeText(txt);return true}catch(_){return false}};
  m.addEventListener('click',async e=>{const t=e.target;
    if(t.closest('[data-x]'))return m.remove();
    if(t.closest('[data-save]')&&blob){try{await offerFile(name,blob);toast('Ficha guardada ✦')}catch(err){toast(err.message||'No se pudo guardar')}return}
    if(t.closest('[data-share]')&&file){copy();try{await navigator.share({files:[file],text:txt,title:'Mi Delulu Journal'})}catch(_){}return}
    if(t.closest('[data-dm]')){if(await copy())toast('Copiamos tu pedido: pegalo en el chat y adjuntá tu ficha',{ms:7000});else{e.preventDefault();m.remove();showOrderText(txt)}}})}
