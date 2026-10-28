
/* ================= export engine: draws the data model straight onto a canvas =================
   Same model the editor uses, no DOM screenshots, so the result is identical on desktop, iOS and Android. */
const IMGC=new Map();
function loadImg(src){if(!src)return Promise.resolve(null);if(IMGC.has(src))return IMGC.get(src);
  const p=new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src});IMGC.set(src,p);return p}
const svgURL=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
function poly(css){return css.replace(/^polygon\(|\)$/g,'').split(',').map(p=>p.trim().split(/\s+/).map(v=>parseFloat(v)/100))}
const PZZ=poly(ZZ),PTORN=poly(TORN);
function pathPoly(ctx,pts,w,h){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.closePath()}
function rr(ctx,x,y,w,h,r){const[a,b,c,d]=Array.isArray(r)?r:[r,r,r,r];ctx.beginPath();ctx.moveTo(x+a,y);ctx.lineTo(x+w-b,y);ctx.quadraticCurveTo(x+w,y,x+w,y+b);ctx.lineTo(x+w,y+h-c);ctx.quadraticCurveTo(x+w,y+h,x+w-c,y+h);ctx.lineTo(x+d,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-d);ctx.lineTo(x,y+a);ctx.quadraticCurveTo(x,y,x+a,y);ctx.closePath()}
function shadow(ctx,blur,oy,a){ctx.shadowColor=`rgba(0,0,0,${a})`;ctx.shadowBlur=blur*ctx.__s;ctx.shadowOffsetY=oy*ctx.__s;ctx.shadowOffsetX=0}
function noShadow(ctx){ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0}
async function texFill(ctx,kind,op,alpha,w,h){const img=await loadImg(makeTex(kind));if(!img)return;ctx.save();ctx.globalCompositeOperation=op;ctx.globalAlpha*=alpha;ctx.fillStyle=ctx.createPattern(img,'repeat');ctx.fillRect(0,0,w,h);ctx.restore()}
function grad115(ctx,W,H,stops){const a=115*Math.PI/180,dx=Math.sin(a),dy=-Math.cos(a),L=Math.abs(W*dx)+Math.abs(H*dy);
  const g=ctx.createLinearGradient(W/2-dx*L/2,H/2-dy*L/2,W/2+dx*L/2,H/2+dy*L/2);stops.forEach(([p,c])=>g.addColorStop(p,c));return g}

/* ---- text ---- */
const fontStr=(e,fs)=>`${e.it?'italic ':''}${e.b?700:400} ${fs}px ${e.font||'Caveat, cursive'}`;
function wrapLines(ctx,text,maxW,fs){const out=[];
  for(const raw of String(text??'').split('\n')){const m=raw.match(/^\s*\[( |x)\]\s?(.*)$/i);const chk=m?(m[1].toLowerCase()==='x'?2:1):0;const body=m?m[2]:raw;const ind=chk?fs*1.25:0,mw=Math.max(10,maxW-ind);
    let first=true;const push=t=>{out.push({t,chk:first?chk:0,ind,done:chk===2});first=false};
    if(!body.trim()){push(body);continue}
    let line='';for(const w of body.split(/(\s+)/)){if(!w)continue;const test=line+w;
      if(ctx.measureText(test).width<=mw){line=test;continue}
      if(/^\s+$/.test(w)){push(line);line='';continue}
      if(line.trim())push(line.replace(/\s+$/,''));line='';
      for(const ch of w){if(line&&ctx.measureText(line+ch).width>mw){push(line);line=''}line+=ch}}
    push(line)}
  return out}
function drawTextBox(ctx,e,w,h,pad,fs,lea){const[pt,pr,,pl]=pad;ctx.font=fontStr(e,fs);ctx.textBaseline='middle';ctx.textAlign='left';
  const lh=fs*1.3,maxW=w-pl-pr,lines=wrapLines(ctx,e.text,maxW,fs),al=e.al||'left',A=ctx.globalAlpha;let fill=e.color||'#3b2d26';
  if(e.fx==='grabado')fill=shade(lea||'#6b4430',-.5);
  else if(e.fx==='dorado'||e.fx==='plata'){const st=e.fx==='dorado'?['#fff3b8','#d4a843','#8f6a1f','#f1d27a']:['#ffffff','#c3c7cc','#7d838a','#eef0f2'];const g=ctx.createLinearGradient(0,0,w*.18,h);[0,.45,.55,1].forEach((p,i)=>g.addColorStop(p,st[i]));fill=g}
  ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();
  lines.forEach((L,i)=>{const y=pt+lh*i+lh/2;if(y-lh/2>h)return;const tw=ctx.measureText(L.t).width+L.ind;
    const x0=al==='center'?pl+(maxW-tw)/2:al==='right'?pl+maxW-tw:pl,x=x0+L.ind;
    if(L.chk){const s=fs*.9,bx=x0,by=y-s/2;ctx.globalAlpha=A;ctx.strokeStyle=typeof fill==='string'?fill:'#7a5a2a';ctx.lineWidth=1.5;rr(ctx,bx,by,s,s,3);ctx.stroke();
      if(L.chk===2){ctx.beginPath();ctx.moveTo(bx+s*.22,by+s*.52);ctx.lineTo(bx+s*.42,by+s*.74);ctx.lineTo(bx+s*.8,by+s*.24);ctx.lineWidth=2;ctx.stroke()}}
    ctx.globalAlpha=A*(L.done?.6:1);
    if(e.fx==='grabado'){ctx.fillStyle='rgba(255,255,255,.26)';ctx.fillText(L.t,x,y+1);ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillText(L.t,x,y-1)}
    if(e.fx==='dorado'||e.fx==='plata'){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillText(L.t,x,y+1)}
    ctx.fillStyle=fill;ctx.fillText(L.t,x,y);
    const lw=ctx.measureText(L.t).width;ctx.fillStyle=fill;
    if(e.u)ctx.fillRect(x,y+fs*.42,lw,Math.max(1,fs/16));
    if(L.done)ctx.fillRect(x,y,lw,Math.max(1,fs/16))});
  ctx.globalAlpha=A;ctx.restore()}

/* ---- elements ---- */
function tapePattern(ctx,p,w,h){ctx.fillStyle='rgba(255,255,255,.55)';ctx.strokeStyle='rgba(255,255,255,.55)';const dot=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()};
  if(p==='stripes')for(let x=8;x<w;x+=12)ctx.fillRect(x,0,4,h);
  if(p==='dots')for(let x=5;x<w+10;x+=10)for(let y=5;y<h+10;y+=10)dot(x,y,2);
  if(p==='grid'){for(let x=0;x<w;x+=8)ctx.fillRect(x,0,1,h);for(let y=0;y<h;y+=8)ctx.fillRect(0,y,w,1)}
  if(p==='diag'){ctx.lineWidth=3;ctx.beginPath();for(let k=-h;k<w+h;k+=9*Math.SQRT2){ctx.moveTo(k,0);ctx.lineTo(k+h,h)}ctx.stroke()}
  if(p==='hearts')for(let x=0;x<w+14;x+=14)for(let y=0;y<h+12;y+=12){dot(x+4.2,y+4.8,2);dot(x+9.8,y+4.8,2)}}
async function drawImageEl(ctx,e,w,h){const img=await loadImg(imgURL(e.img)),mk=maskOf(e);
  if(mk){const P=new Path2D();try{P.addPath(new Path2D(mk==='lasso'?e.lasso:MASK_PATHS[mk]),new DOMMatrix([w,0,0,h,0,0]))}catch(_){P.rect(0,0,w,h)}
    ctx.save();if(e.shadow!==false)shadow(ctx,8,6,.28);ctx.fillStyle='#fff';if(e.outline){ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeStyle='#fff';ctx.stroke(P)}ctx.fill(P);ctx.restore();
    if(e.outline){ctx.save();ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeStyle='#fff';ctx.stroke(P);ctx.restore()}
    ctx.save();ctx.clip(P);if(img){const s=Math.max(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*s,dh=img.naturalHeight*s,dx=(w-dw)*(e.px??50)/100,dy=(h-dh)*(e.py??50)/100,z=e.zoom||1;ctx.drawImage(img,w/2+(dx-w/2)*z,h/2+(dy-h/2)*z,dw*z,dh*z)}ctx.restore();return}
  const fr=e.frame||'none';
  let pt=0,pr=0,pb=0,pl=0;if(fr==='polaroid'){pt=.08*w;pr=pl=.06*w;pb=.22*w}else if(fr==='borde'){pt=pr=pb=pl=.05*w}
  const iw=w-pl-pr,ih=h-pt-pb,white=fr==='polaroid'||fr==='borde';
  const outer=()=>{if(fr==='circulo'){ctx.beginPath();ctx.ellipse(w/2,h/2,w/2,h/2,0,0,7)}else rr(ctx,0,0,w,h,fr==='redondo'?16:white?2:0)};
  const inner=()=>{if(fr==='circulo'){ctx.beginPath();ctx.ellipse(pl+iw/2,pt+ih/2,iw/2,ih/2,0,0,7)}else rr(ctx,pl,pt,iw,ih,fr==='redondo'?14:0)};
  ctx.save();if(e.shadow!==false)shadow(ctx,8,6,.28);ctx.fillStyle=white?'#fff':'#e8e0d6';white?outer():inner();ctx.fill();ctx.restore();
  ctx.save();inner();ctx.clip();if(img){const s=Math.max(iw/img.naturalWidth,ih/img.naturalHeight),dw=img.naturalWidth*s,dh=img.naturalHeight*s,dx=(iw-dw)*(e.px??50)/100,dy=(ih-dh)*(e.py??50)/100,z=e.zoom||1;
    ctx.drawImage(img,pl+iw/2+(dx-iw/2)*z,pt+ih/2+(dy-ih/2)*z,dw*z,dh*z)}ctx.restore();
  if(fr==='polaroid'&&e.cap){const fs=Math.max(14,h*.07);ctx.font=`400 ${fs}px Caveat, cursive`;ctx.fillStyle='#4a3a33';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(e.cap,w/2,h-h*.04-fs*.25);ctx.textAlign='left'}}
async function drawSticker(ctx,e,w,h){const sc=ctx.__s;ctx.save();shadow(ctx,3,3,.22);
  if(e.custom){const img=await loadImg(imgURL(e.custom));if(img){const k=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*k,dh=img.naturalHeight*k;ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh)}}
  else{const st=STICKERS.find(s=>s.id===e.sid)||STICKERS[0];const pw=Math.ceil(w*1.16*sc*1.5),ph=Math.ceil(h*1.16*sc*1.5);
    const[vx,vy,vw,vh]=(st.vb||'0 0 100 100').split(' ').map(Number);const img=await loadImg(svgURL(`<svg viewBox="${vx-vw*.08} ${vy-vh*.08} ${vw*1.16} ${vh*1.16}" width="${pw}" height="${ph}" preserveAspectRatio="none">${st.s(e.color||st.col)}</svg>`));
    if(img)ctx.drawImage(img,-.08*w,-.08*h,w*1.16,h*1.16)}
  ctx.restore()}
async function drawPaper(ctx,e,w,h){const c=e.color;ctx.save();
  switch(e.pid){
    case 'torn':shadow(ctx,2,2,.2);pathPoly(ctx,PTORN,w,h);ctx.fillStyle=c||'#fffdf6';ctx.fill();break;
    case 'lined':shadow(ctx,6,3,.18);ctx.fillStyle=c||'#fffefa';ctx.fillRect(0,0,w,h);noShadow(ctx);ctx.fillStyle='#b9cde0';for(let y=21;y<h;y+=22)ctx.fillRect(0,y,w,1);ctx.fillStyle='#e6a3a8';ctx.fillRect(0,0,2,h);break;
    case 'gridp':pathPoly(ctx,PTORN,w,h);ctx.fillStyle=c||'#fbfbf8';ctx.fill();ctx.clip();ctx.fillStyle='#c9d8e8';for(let x=0;x<w;x+=14)ctx.fillRect(x,0,1,h);for(let y=0;y<h;y+=14)ctx.fillRect(0,y,w,1);break;
    case 'kraft':shadow(ctx,6,3,.2);ctx.fillStyle=c||'#c8a57c';ctx.fillRect(0,0,w,h);noShadow(ctx);ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();await texFill(ctx,'liso','soft-light',1,w,h);break;
    case 'polaroid':shadow(ctx,10,6,.3);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);noShadow(ctx);ctx.fillStyle=c||'#e9e2d7';ctx.fillRect(.07*w,.07*h,w*.86,h*.69);break;
    default:ctx.fillStyle=c||'#f6e3a1';ctx.fillRect(0,0,w,h)}
  ctx.restore()}
async function drawEl(ctx,e,lea){const w=e.w,h=e.h;ctx.save();ctx.translate(e.x+w/2,e.y+h/2);ctx.rotate((e.r||0)*Math.PI/180);ctx.translate(-w/2,-h/2);ctx.globalAlpha=e.op??1;
  switch(e.type){
    case 'text':if(e.bg==='papel'){ctx.fillStyle='#fffdf7';pathPoly(ctx,PTORN,w,h);ctx.fill()}else if(e.bg==='cinta'){ctx.fillStyle=e.bgc||'#f3dfe1';ctx.fillRect(0,0,w,h)}
      drawTextBox(ctx,e,w,h,e.bg==='papel'?[14,16,14,16]:e.bg==='cinta'?[8,12,8,12]:[2,0,0,0],e.fs||24,lea);break;
    case 'note':ctx.save();shadow(ctx,6,4,.3);ctx.fillStyle=e.bgc||'#f6e3a1';ctx.fillRect(0,0,w,h);ctx.restore();ctx.fillStyle='rgba(0,0,0,.05)';ctx.fillRect(0,0,w,16);
      drawTextBox(ctx,e,w,h,[16,14,16,14],e.fs||22,lea);break;
    case 'image':await drawImageEl(ctx,e,w,h);break;
    case 'sticker':await drawSticker(ctx,e,w,h);break;
    case 'tape':ctx.globalAlpha*=.88;ctx.save();shadow(ctx,2,1,.1);pathPoly(ctx,PZZ,w,h);ctx.fillStyle=e.color||'#e9c2c4';ctx.fill();ctx.restore();pathPoly(ctx,PZZ,w,h);ctx.clip();tapePattern(ctx,e.pat,w,h);break;
    case 'paper':await drawPaper(ctx,e,w,h);break;
    case 'stroke':ctx.scale(w/(e.vw||w),h/(e.vh||h));ctx.lineWidth=e.sw;ctx.lineCap=ctx.lineJoin='round';ctx.strokeStyle=e.color;if(e.tool==='marker')ctx.globalAlpha*=.45;try{ctx.stroke(new Path2D(e.d))}catch(_){}break;
  }
  ctx.restore()}

/* ---- pages, cover, spread ---- */
async function drawPageBg(ctx,bg,W,H){const c=bg?.color||'#fbf7f0',t=bg?.type,l='rgba(120,150,180,.28)';
  if(t==='kraft'){ctx.fillStyle=bg.color&&bg.color!=='#fbf7f0'?bg.color:'#d2b48c';ctx.fillRect(0,0,W,H);await texFill(ctx,'liso','soft-light',1,W,H);return}
  ctx.fillStyle=c;ctx.fillRect(0,0,W,H);ctx.fillStyle=l;
  if(t==='lines')for(let y=5;y<H;y+=32)ctx.fillRect(0,y,W,1);
  if(t==='grid'){for(let x=0;x<W;x+=22)ctx.fillRect(x,0,1,H);for(let y=0;y<H;y+=22)ctx.fillRect(0,y,W,1)}
  if(t==='dots'){ctx.fillStyle='rgba(110,90,80,.35)';for(let x=11;x<W;x+=22)for(let y=11;y<H;y+=22){ctx.beginPath();ctx.arc(x,y,1.4,0,7);ctx.fill()}}
  if(t==='vintage'){await texFill(ctx,'natural','soft-light',1,W,H);ctx.save();ctx.translate(W/2,H/2);ctx.scale(1,H/W);const r=W/2*Math.SQRT2*1.05;const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(.5,'rgba(150,110,60,0)');g.addColorStop(1,'rgba(150,110,60,.18)');ctx.fillStyle=g;ctx.fillRect(-W,-W,W*2,W*2);ctx.restore()}}
async function renderPage(ctx,p,W,H,num,side){ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();await drawPageBg(ctx,p.bg,W,H);
  for(const e of p.elements)await drawEl(ctx,e,null);
  if(num){ctx.font='500 12px Figtree, sans-serif';ctx.fillStyle='#a8988a';ctx.textBaseline='bottom';ctx.textAlign=side==='l'?'left':'right';ctx.fillText(String(num),side==='l'?14:W-14,H-8);ctx.textAlign='left'}
  ctx.restore()}
function coverPattern(ctx,p,W,H){const line=(x1,y1,x2,y2)=>{ctx.moveTo(x1,y1);ctx.lineTo(x2,y2)};ctx.save();
  if(p==='rombos'){ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;ctx.beginPath();for(let k=-H;k<W+H;k+=23*Math.SQRT2){line(k,0,k+H,H);line(k+H,0,k,H)}ctx.stroke()}
  if(p==='puntos'){ctx.fillStyle='rgba(255,255,255,.13)';for(let x=8;x<W;x+=16)for(let y=8;y<H;y+=16){ctx.beginPath();ctx.arc(x,y,1.5,0,7);ctx.fill()}}
  if(p==='rayas'){ctx.fillStyle='rgba(0,0,0,.08)';for(let x=18;x<W;x+=22)ctx.fillRect(x,0,4,H)}
  if(p==='floral'){for(let x=20;x<W+40;x+=40)for(let y=20;y<H+40;y+=40){ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(x,y,3,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.arc(x+20,y+20,8,0,7);ctx.fill()}}
  if(p==='cuadros'){ctx.fillStyle='rgba(0,0,0,.09)';for(let x=0;x<W;x+=34)ctx.fillRect(x,0,2,H);for(let y=0;y<H;y+=34)ctx.fillRect(0,y,W,2)}
  ctx.restore()}
function drawBand(ctx,a,W,H,back){const e=a.cover.elastic,t=e.width||9,c=e.color,vert=e.orient!=='horizontal',pos=e.pos??(vert?.84:.6);
  let x,y,w,h;if(vert){x=(back?W*(1-pos):W*pos)-t/2;y=-8;w=t;h=H+20}else{x=back?-14:-8;y=H*pos-t/2;w=W+22;h=t}
  const g=vert?ctx.createLinearGradient(x,0,x+t,0):ctx.createLinearGradient(0,y,0,y+t);
  const st=e.style==='plano'?[[0,shade(c,-.25)],[.2,c],[.8,c],[1,shade(c,-.25)]]:[[0,shade(c,-.45)],[.45,shade(c,.25)],[.6,c],[1,shade(c,-.45)]];st.forEach(([p,col])=>g.addColorStop(p,col));
  ctx.save();shadow(ctx,4,3,.35);rr(ctx,x,y,w,h,t/2);ctx.fillStyle=e.style==='trenzado'?shade(c,.15):g;ctx.fill();noShadow(ctx);
  if(e.style==='trenzado'){ctx.clip();ctx.strokeStyle=shade(c,-.25);ctx.lineWidth=3;ctx.beginPath();for(let k=vert?y-t:x-t;k<(vert?y+h:x+w)+t;k+=6){vert?(ctx.moveTo(x,k),ctx.lineTo(x+t,k+t*.7)):(ctx.moveTo(k,y+t),ctx.lineTo(k+t*.7,y))}ctx.stroke()}
  if(e.style==='plano'){ctx.strokeStyle='rgba(255,255,255,.4)';ctx.setLineDash([3,3]);ctx.lineWidth=1;ctx.beginPath();vert?(ctx.moveTo(x+t/2,y),ctx.lineTo(x+t/2,y+h)):(ctx.moveTo(x,y+t/2),ctx.lineTo(x+w,y+t/2));ctx.stroke()}
  ctx.restore()}
async function drawCharms(ctx,a,W,H){const e=a.cover.elastic,list=a.cover.charms||[],offs=[0,-22,22,-42,42,-62],vert=e.orient!=='horizontal';
  for(let i=0;i<list.length;i++){const c=list[i],s=46*(c.size||1);const cx=vert?W*(e.pos??.84)+offs[i%6]*.6:W*.5+offs[i%6];const cy=vert?H*.42+i*8:H*(e.pos??.6)-4;
    const img=await loadImg(svgURL(charmSVG(c,Math.ceil(s*ctx.__s*1.5))));if(!img)continue;
    ctx.save();ctx.translate(cx,cy-s*.12);ctx.rotate((i%2?4:-5)*Math.PI/180);ctx.drawImage(img,-s/2,0,s,s*1.5);ctx.restore()}}
async function renderCover(ctx,a,W,H,back){const c=a.cover;ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
  ctx.fillStyle=c.color;ctx.fillRect(0,0,W,H);
  if(!back&&c.photo&&S.images[c.photo]){const img=await loadImg(S.images[c.photo]);if(img){ctx.save();ctx.globalAlpha=c.photoOp??.85;ctx.globalCompositeOperation=c.photoBlend||'multiply';const k=Math.max(W/img.naturalWidth,H/img.naturalHeight);ctx.drawImage(img,(W-img.naturalWidth*k)/2,(H-img.naturalHeight*k)/2,img.naturalWidth*k,img.naturalHeight*k);ctx.restore()}}
  await texFill(ctx,c.texture||'liso','overlay',c.texture==='liso'?.5:.85,W,H);coverPattern(ctx,c.pattern,W,H);
  ctx.save();if(back){ctx.translate(W,0);ctx.scale(-1,1)}
  const sp=ctx.createLinearGradient(0,0,W*.07,0);sp.addColorStop(0,'rgba(0,0,0,.35)');sp.addColorStop(.6,'rgba(255,255,255,.06)');sp.addColorStop(1,'rgba(0,0,0,.15)');ctx.fillStyle=sp;ctx.fillRect(0,0,W*.07,H);
  const sh=ctx.createLinearGradient(0,0,16,0);sh.addColorStop(0,'rgba(0,0,0,.3)');sh.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sh;ctx.fillRect(0,0,16,H);
  if(c.model==='delulu'){ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(W*.86,0,W*.14,H);
    ctx.save();ctx.shadowColor='rgba(0,0,0,.42)';ctx.shadowBlur=9*ctx.__s;ctx.shadowOffsetX=3*ctx.__s;rr(ctx,-20,-4,W*.86+20,H+8,[0,W*.06,W*.06,0]);ctx.fillStyle=c.color;ctx.fill();ctx.restore();
    ctx.save();rr(ctx,-20,-4,W*.86+20,H+8,[0,W*.06,W*.06,0]);ctx.clip();await texFill(ctx,c.texture||'liso','overlay',c.texture==='liso'?.5:.85,W,H);ctx.restore();
    for(const y of[H*.045,H*.955]){const r=W*.011,g=ctx.createRadialGradient(W*.027-r*.3,y-r*.3,0,W*.027,y,r);g.addColorStop(0,'#9aa0a6');g.addColorStop(1,'#2c2f33');ctx.fillStyle=g;ctx.beginPath();ctx.arc(W*.027,y,r,0,7);ctx.fill()}}
  else{ctx.strokeStyle='rgba(255,240,220,.45)';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);rr(ctx,7,7,W-14,H-14,[6,10,10,6]);ctx.stroke();ctx.setLineDash([])}ctx.restore();
  if(isTornasol(c)){ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.6;let g;
    if(ctx.createConicGradient){g=ctx.createConicGradient(3.5,W*.3,H*.3);[['#ffd6ec',0],['#d6ecff',.25],['#dcffe6',.5],['#fff4c6',.75],['#ffd6ec',1]].forEach(([col,p])=>g.addColorStop(p,col))}else{g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ffd6ec');g.addColorStop(.5,'#d6ecff');g.addColorStop(1,'#fff4c6')}
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}
  if(!back)for(const e of c.elements||[])await drawEl(ctx,e,c.color);
  ctx.fillStyle=grad115(ctx,W,H,c.finish==='brillo'?[[0,'rgba(255,255,255,.28)'],[.35,'rgba(255,255,255,0)'],[.6,'rgba(255,255,255,0)'],[.75,'rgba(255,255,255,.12)'],[.9,'rgba(255,255,255,0)']]:[[0,'rgba(255,255,255,.08)'],[.4,'rgba(255,255,255,0)']]);ctx.fillRect(0,0,W,H);
  drawBand(ctx,a,W,H,back);if(!back)await drawCharms(ctx,a,W,H);ctx.restore()}
async function canvasOf(w,h,sc,fn){const c=document.createElement('canvas');c.width=Math.round(w*sc);c.height=Math.round(h*sc);const ctx=c.getContext('2d');ctx.scale(sc,sc);ctx.__s=sc;await fn(ctx);return c}
async function renderJob(a,job,sc){const[W,H]=dims(a);
  if(job.k==='cover'||job.k==='back')return canvasOf(W,H,sc,ctx=>renderCover(ctx,a,W,H,job.k==='back'));
  if(job.k==='page')return canvasOf(W,H,sc,ctx=>renderPage(ctx,a.pages[job.i],W,H,job.i+1,'r'));
  const SW=W*2+28,SH=H+28;
  return canvasOf(SW,SH,sc,async ctx=>{ctx.fillStyle='#efe6d8';ctx.fillRect(0,0,SW,SH);ctx.save();rr(ctx,0,0,SW,SH,[14,20,20,14]);ctx.fillStyle=a.cover.color;ctx.fill();ctx.clip();await texFill(ctx,a.cover.texture||'liso','overlay',.6,SW,SH);ctx.restore();
    for(const[k,i]of[[0,job.l],[1,job.r]]){ctx.save();ctx.translate(14+k*W,14);
      if(i==null||!a.pages[i]){ctx.fillStyle='#fbf7f0';ctx.fillRect(0,0,W,H)}else await renderPage(ctx,a.pages[i],W,H,i+1,k?'r':'l');
      const g=k?ctx.createLinearGradient(0,0,22,0):ctx.createLinearGradient(W,0,W-22,0);g.addColorStop(0,'rgba(0,0,0,.22)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(k?0:W-22,0,22,H);ctx.restore()}
    const rg=ctx.createLinearGradient(SW/2-13,0,SW/2+13,0);rg.addColorStop(0,'rgba(0,0,0,.3)');rg.addColorStop(.5,'rgba(0,0,0,.05)');rg.addColorStop(1,'rgba(0,0,0,.3)');ctx.fillStyle=rg;ctx.fillRect(SW/2-13,0,26,SH)})}
function jobsFor(a,o){const n=a.pages.length,from=clamp((o.from||1)-1,0,n-1),to=clamp((o.to||n)-1,from,n-1),J=[];
  if(o.cover)J.push({k:'cover'});
  if(o.layout==='spread'){let s=from-(from%2);for(let i=s;i<=to;i+=2)J.push({k:'spread',l:i>=from?i:null,r:i+1<=to?i+1:null})}
  else for(let i=from;i<=to;i++)J.push({k:'page',i});
  if(o.cover)J.push({k:'back'});return J}
async function ensureFonts(){try{await Promise.all([...FONTS.map(f=>'24px '+f[1]),'italic 24px "Playfair Display"','italic 24px "Cormorant Garamond"','700 24px Figtree','500 12px Figtree','700 24px Caveat'].map(f=>document.fonts.load(f)));await document.fonts.ready}catch(e){}}

/* ---- file writers (no external libraries) ---- */
const toBytes=(c,type,q)=>new Promise((res,rej)=>c.toBlob(b=>b?b.arrayBuffer().then(x=>res(new Uint8Array(x)),rej):rej(new Error('canvas')),type,q));
function buildPDF(pages,title){const enc=new TextEncoder(),chunks=[],offs=[];let len=0;const push=d=>{const b=typeof d==='string'?enc.encode(d):d;chunks.push(b);len+=b.length};
  const obj=(id,body)=>{offs[id]=len;push(`${id} 0 obj\n`);body();push('\nendobj\n')};const n=pages.length,info=3+3*n,total=info+1;
  push('%PDF-1.4\n');push(new Uint8Array([37,226,227,207,211,10]));
  obj(1,()=>push('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2,()=>push(`<< /Type /Pages /Count ${n} /Kids [${pages.map((_,i)=>`${3+3*i} 0 R`).join(' ')}] >>`));
  pages.forEach((p,i)=>{const id=3+3*i,pw=+p.pw.toFixed(2),ph=+p.ph.toFixed(2),cs=`q ${pw} 0 0 ${ph} 0 0 cm /Im${i} Do Q`;
    obj(id,()=>push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im${i} ${id+2} 0 R >> >> /Contents ${id+1} 0 R >>`));
    obj(id+1,()=>push(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
    obj(id+2,()=>{push(`<< /Type /XObject /Subtype /Image /Width ${p.iw} /Height ${p.ih} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`);push(p.jpeg);push('\nendstream')})});
  let hex='FEFF';for(let i=0;i<title.length;i++)hex+=title.charCodeAt(i).toString(16).padStart(4,'0').toUpperCase();
  obj(info,()=>push(`<< /Title <${hex}> /Creator (Delulu Journal) >>`));
  const xref=len;push(`xref\n0 ${total}\n0000000000 65535 f \n`+offs.slice(1,total).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join(''));
  push(`trailer\n<< /Size ${total} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);return new Blob(chunks,{type:'application/pdf'})}
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function buildZip(files){const enc=new TextEncoder(),parts=[],central=[];let off=0;
  for(const f of files){const nm=enc.encode(f.name),crc=crc32(f.data),sz=f.data.length;
    const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(12,0x21,true);h.setUint32(14,crc,true);h.setUint32(18,sz,true);h.setUint32(22,sz,true);h.setUint16(26,nm.length,true);
    parts.push(new Uint8Array(h.buffer),nm,f.data);
    const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(14,0x21,true);c.setUint32(16,crc,true);c.setUint32(20,sz,true);c.setUint32(24,sz,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
    central.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+sz}
  const cd=central.reduce((s,b)=>s+b.length,0),e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cd,true);e.setUint32(16,off,true);
  return new Blob([...parts,...central,new Uint8Array(e.buffer)],{type:'application/zip'})}
const slug=s=>(s||'agenda').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'agenda';

/* ---- handing the file to the viewer ---- */
async function offerFile(filename,blob){const dl=await cap('downloads');
  if(!dl){const u=URL.createObjectURL(blob),l=document.createElement('a');l.href=u;l.download=filename;l.rel='noopener';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);return {ok:true}}
  try{return await dl.save({filename,data:blob})}catch(err){const m={declined:'Cancelaste la descarga. El archivo sigue listo si quieres intentarlo de nuevo.',too_large:'El archivo es demasiado grande para este destino. Prueba con calidad Normal o menos páginas.',rate_limited:'Ya hay una descarga esperando tu confirmación.'}[err?.code];
    throw{code:err?.code||'unavailable',message:m||'No se pudo guardar el archivo en esta vista.'}}}

/* ---- backup: one agenda + the images it uses ---- */
/* A backup holds one agenda or all of them, plus every photo and sticker they use. */
function backupOf(a){const list=Array.isArray(a)?a:[a],used=new Set(JSON.stringify(list).match(/img_[a-z0-9]+/g)||[]);const images={};used.forEach(id=>{if(S.images[id])images[id]=S.images[id]});
  return JSON.stringify({journaly:1,exported:new Date().toISOString(),...(Array.isArray(a)?{agendas:list}:{agenda:a}),images})}
const EL_TYPES=new Set(['text','note','image','sticker','tape','paper','stroke']);
function importBackup(txt){let o;try{o=JSON.parse(txt)}catch(e){throw new Error('El archivo no es una copia de Delulu Journal válida.')}
  const list=o&&o.journaly===1?(Array.isArray(o.agendas)?o.agendas:[o.agenda]):null;
  if(!list||!list.length||!list.every(a=>a&&Array.isArray(a.pages)&&a.cover))throw new Error('El archivo no es una copia de Delulu Journal válida.');
  const map={};for(const[k,v]of Object.entries(o.images||{})){if(typeof v==='string'&&/^data:image\/(png|jpe?g|webp|gif);base64,/.test(v)){const id='img_'+uid();S.images[id]=v;map[k]=id}}
  const out=list.map(a=>importOne(a,map));persist();return out}
function importOne(a,map){const n=JSON.parse(JSON.stringify(a).replace(/img_[a-z0-9]+/g,m=>map[m]||'img_missing'));
  const num=v=>Number.isFinite(+v)?+v:0;const fixEl=e=>{e.id=uid();['x','y','w','h','r'].forEach(k=>e[k]=num(e[k]));e.w=Math.max(4,e.w);e.h=Math.max(4,e.h);return e};
  n.id=uid();n.name=String(n.name||'Agenda importada').slice(0,60);n.updated=Date.now();if(!SIZES[n.size])n.size='a5';
  n.pages=n.pages.filter(p=>p&&Array.isArray(p.elements)).map(p=>({id:uid(),bg:p.bg&&typeof p.bg==='object'?p.bg:{type:'plain',color:'#fbf7f0'},elements:p.elements.filter(e=>e&&EL_TYPES.has(e.type)).map(fixEl)}));
  if(!n.pages.length)n.pages=[pg('lines')];
  const d=coverDefaults();n.cover=Object.assign(d,n.cover);n.cover.elements=(n.cover.elements||[]).filter(e=>e&&EL_TYPES.has(e.type)).map(fixEl);n.cover.elastic=Object.assign(coverDefaults().elastic,n.cover.elastic);n.cover.charms=(n.cover.charms||[]).slice(0,6);
  if(S.agendas.some(x=>x.name===n.name))n.name+=' (importada)';S.agendas.push(n);return n}

/* ---- export dialog ---- */
function openExport(a){if(ED.sel)deselect();const n=a.pages.length,cur=ED.a===a&&$('#open').classList.contains('show')?activePageIndex()+1:1;
  const o={fmt:'pdf',layout:'single',cover:true,range:'all',from:1,to:n,q:'normal'};let busy=null;
  const m=modal(`<header><h2>Exportar “${esc(a.name)}”</h2><div class="spacer"></div><button class="btn ghost icon" data-x aria-label="Cerrar">${ico('x')}</button></header>
   <div class="content"><div style="display:flex;flex-direction:column;gap:16px;min-width:0">
    <div class="field"><span class="lbl">Formato</span>${chipRow('fmt',[['pdf','PDF'],['png','Imágenes PNG'],['html','Página web'],['json','Copia de seguridad']],o.fmt)}<span class="hint" id="xFmtHint"></span></div>
    <div class="xvis" style="display:flex;flex-direction:column;gap:16px">
     <div class="field"><span class="lbl">Diseño</span>${chipRow('layout',[['single','Una página por hoja'],['spread','Doble página']],o.layout)}</div>
     <div class="field"><span class="lbl">Páginas</span>${chipRow('range',[['all',`Todas (${n})`],['cur',`Solo la ${cur}`],['custom','Rango']],o.range)}
      <div class="swrow" id="xRange" hidden><label class="hint" for="xFrom">Desde</label><input id="xFrom" type="number" min="1" max="${n}" value="1" class="numin"><label class="hint" for="xTo">hasta</label><input id="xTo" type="number" min="1" max="${n}" value="${n}" class="numin"></div></div>
     <label class="hint" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="xCover" checked> Incluir portada y contraportada</label>
     <div class="field"><span class="lbl">Calidad</span>${chipRow('q',[['normal','Normal'],['alta','Alta, para imprimir']],o.q)}</div>
    </div></div>
    <div class="preview-box" style="flex-direction:column;gap:10px"><canvas id="xPrev" style="max-width:100%;max-height:300px;border-radius:6px;box-shadow:0 10px 24px -12px rgba(40,20,10,.6)"></canvas><span class="hint" id="xSum"></span></div></div>
   <footer style="align-items:center"><div class="xprog" hidden><div class="prog"><i></i></div><span class="hint" id="xMsg"></span></div><div class="spacer"></div><button class="btn" data-x>Cancelar</button><button class="btn primary" data-go>${ico('dl')}Exportar</button></footer>`);
  const prevC=$('#xPrev',m),sum=$('#xSum',m);let pv=0;
  const sync=()=>{o.from=o.range==='cur'?cur:o.range==='custom'?+$('#xFrom',m).value||1:1;o.to=o.range==='cur'?cur:o.range==='custom'?+$('#xTo',m).value||n:n;o.cover=$('#xCover',m).checked;
    $('#xRange',m).hidden=o.range!=='custom';$('.xvis',m).hidden=o.fmt==='json';
    $('#xFmtHint',m).textContent={pdf:'Un solo archivo con toda la agenda. Se abre en cualquier teléfono o computadora y se puede imprimir.',png:'Una imagen por hoja, lista para compartir. Varias imágenes llegan juntas en un .zip.',html:'Una página web hojeable con toda la agenda. Súbela a tu portafolio o a GitHub Pages; funciona sin Delulu Journal.',json:'Guarda la agenda completa con sus fotos para restaurarla o pasarla a otro navegador con “Importar”.'}[o.fmt];
    const J=jobsFor(a,o);sum.textContent=o.fmt==='json'?`${n} páginas, portada, charms y fotos`:`${J.length} ${J.length===1?'hoja':'hojas'} · ${o.fmt==='pdf'?'PDF':o.fmt==='html'?'página web':J.length>1?'ZIP con PNG':'PNG'}`;
    const id=++pv;renderJob(a,o.fmt==='json'?{k:'cover'}:J[0],1).then(c=>{if(id!==pv)return;const W=c.width,H=c.height;prevC.width=W;prevC.height=H;prevC.getContext('2d').drawImage(c,0,0)})};
  m.addEventListener('click',ev=>{const b=ev.target.closest('[data-v]');if(b&&!busy){const f=b.parentElement.dataset.f;o[f]=b.dataset.v;$$('[data-v]',b.parentElement).forEach(x=>x.classList.toggle('on',x===b));sync()}
    if(ev.target.closest('[data-x]')){if(busy){busy.cancel=true;return}m.remove()}
    if(ev.target.closest('[data-go]')&&!busy)run()});
  m.addEventListener('input',ev=>{if(/xFrom|xTo|xCover/.test(ev.target.id))sync()});
  ensureFonts().then(sync);sync();
  const prog=(p,msg)=>{$('.xprog',m).hidden=false;$('.prog i',m).style.width=Math.round(p*100)+'%';$('#xMsg',m).textContent=msg};
  async function run(){busy={cancel:false};const go=$('[data-go]',m);go.disabled=true;$$('.chip,input',m).forEach(x=>x.disabled=true);const base=slug(a.name);
    try{let file,blob;
      if(o.fmt==='json'){prog(.5,'Preparando copia…');blob=new Blob([backupOf(a)],{type:'application/json'});file=`${base}.journaly.json`}
      else{await ensureFonts();const J=jobsFor(a,o),sc=o.q==='alta'?3:2,out=[];
        for(let i=0;i<J.length;i++){if(busy.cancel)throw{code:'cancel'};prog(i/J.length,`Dibujando hoja ${i+1} de ${J.length}…`);
          const c=await renderJob(a,J[i],sc);const iw=c.width,ih=c.height;
          const bytes=await toBytes(c,o.fmt==='png'?'image/png':'image/jpeg',o.fmt==='html'?.85:.92);c.width=c.height=0;
          const nm=J[i].k==='cover'?'portada':J[i].k==='back'?'contraportada':J[i].k==='page'?`pagina-${J[i].i+1}`:`paginas-${(J[i].l??J[i].r)+1}${J[i].r!=null&&J[i].l!=null?'-'+(J[i].r+1):''}`;
          out.push({jpeg:bytes,iw,ih,pw:iw/sc*.75,ph:ih/sc*.75,name:`${String(i+1).padStart(2,'0')}-${nm}.png`,data:bytes});await new Promise(r=>setTimeout(r,0))}
        prog(1,'Armando el archivo…');
        const lbl=J.map(j=>j.k==='cover'?'Portada':j.k==='back'?'Contraportada':j.k==='page'?`Página ${j.i+1}`:`Páginas ${(j.l??j.r)+1}${j.l!=null&&j.r!=null?'–'+(j.r+1):''}`);
        if(o.fmt==='html'){const b64=u=>{let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)};
          blob=new Blob([flipbookHTML(a.name,out.map((x,i)=>({src:'data:image/jpeg;base64,'+b64(x.jpeg),label:lbl[i]})))],{type:'text/html'});file=`${base}.html`}
        else if(o.fmt==='pdf'){blob=buildPDF(out,a.name);file=`${base}.pdf`}
        else if(out.length===1){blob=new Blob([out[0].data],{type:'image/png'});file=`${base}-${out[0].name.slice(3)}`}
        else{blob=buildZip(out);file=`${base}-imagenes.zip`}}
      prog(1,`Listo: ${(blob.size/1048576).toFixed(1)} MB. Confirma la descarga.`);
      const r=await offerFile(file,blob);m.remove();toast(r?.status==='delivered'?'Archivo enviado':'Archivo guardado')}
    catch(err){if(err?.code==='cancel'){prog(0,'Exportación cancelada')}else prog(1,err?.message||'No se pudo exportar la agenda.');$('.prog i',m).style.width='0%'}
    finally{busy=null;go.disabled=false;$$('.chip,input',m).forEach(x=>x.disabled=false)}}}

$('#impBackup')?.addEventListener('change',async ev=>{const f=ev.target.files[0];ev.target.value='';if(!f)return;
  if(f.size>200*1048576)return toast('El archivo es demasiado grande');
  try{const l=importBackup(await f.text());go('home');toast(l.length===1?`“${l[0].name}” importada`:`${l.length} agendas importadas`)}catch(e){toast(e.message)}});
