
/* ================= "Pedí tu libreta": build a real Delulu step by step and order it by DM ================= */
const ORD={step:0,size:'a5',ins5:['lineas','blancas','puntos'],bk:0,view:'closed',leather:'cafe',elastic:'azul',charm:'concha',ry:24};
/* pasos: 0 inicio · 1 tamaño · 2 por dentro · 3 cuero · 4 elástico · 5 charm · 6 listo */
const ORD_STEPS=[{bg:'green'},{bg:'cream'},{bg:'pink'},{bg:'green'},{bg:'pink'},{bg:'cream'},{bg:'green'}],ORD_LAST=6,ORD_N=5;
/* por dentro: 3 libritos. A5 = líneas, blancas o puntos (cada uno); A6 = solo blancas */
const DL_INSERTS=[['lineas','Líneas'],['blancas','Blancas'],['puntos','Puntos']];
const orderInserts=()=>ORD.size==='a6'?['blancas','blancas','blancas']:ORD.ins5;
const insName=id=>dlPick(DL_INSERTS,id)[1];
function insertsLabel(){const i=orderInserts();if(ORD.size==='a6')return'3 libritos blancos';if(i.every(x=>x===i[0]))return`3 libritos de ${insName(i[0]).toLowerCase()}`;return i.map(insName).join(' · ')}
const dlPick=(list,id)=>list.find(x=>x[0]===id)||list[0];
/* the notebook being ordered, as a digital agenda (used for the 3D preview and "crear en digital") */
function orderAgenda(o=ORD){const lc=dlPick(DL_LEATHERS,o.leather)[2],ec=dlPick(DL_ELASTICS,o.elastic)[2];
  const a=newAgenda({name:'Mi Delulu',type:'blank',size:o.size,color:lc,elastic:ec,charm:o.charm,noTitle:true});
  a.pages=Array.from({length:8},()=>pg('lines'));return a}
function orderCode(){if(!ORD.code){const d=new Date(),p=n=>String(n).padStart(2,'0'),abc='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=crypto.getRandomValues(new Uint8Array(3));
  ORD.code=`DJ-${String(d.getFullYear()).slice(2)}${p(d.getMonth()+1)}${p(d.getDate())}-${[...r].map(x=>abc[x%abc.length]).join('')}`;ORD.date=d}return ORD.code}
function orderRows(){const s=dlPick(DL_SIZES,ORD.size),l=dlPick(DL_LEATHERS,ORD.leather),e=dlPick(DL_ELASTICS,ORD.elastic),c=dlPick(DL_CHARMS,ORD.charm);
  return[['Tamaño',`${s[1]} · ${s[2]}`,1],['Por dentro',insertsLabel(),2],['Color del cuero',l[1],3],['Color del elástico',e[1],4],['Charm',c[1],5]]}
/* datos de entrega: se guardan solo en este navegador, para no volver a escribirlos */
const SHIP_KEY='delulu-entrega';ORD.ship=(()=>{try{return Object.assign({name:'',addr:'',phone:''},JSON.parse(localStorage.getItem(SHIP_KEY)||'{}'))}catch(_){return{name:'',addr:'',phone:''}}})();
const saveShip=()=>{try{localStorage.setItem(SHIP_KEY,JSON.stringify(ORD.ship))}catch(_){}};
const SHIP_FIELDS=[['name','Nombre completo'],['addr','Dirección de entrega'],['phone','Teléfono']];
function shipMissing(){const f=ORD.ship;if(f.name.trim().length<3)return'name';if(f.addr.trim().length<8)return'addr';if(f.phone.replace(/\D/g,'').length<8)return'phone';return null}
const orderPrice=()=>dlPick(DL_SIZES,ORD.size)[4],orderTotal=()=>orderPrice()+DL_SHIP;
function orderText(){return `¡Hola! Quiero mi Delulu Journal ✦\nPedido N.º ${orderCode()}\n${orderRows().map(([k,v])=>`• ${k}: ${v}`).join('\n')}\n• Precio: ${qz(orderPrice())} + ${qz(DL_SHIP)} de envío = ${qz(orderTotal())}\n\nDatos de entrega\n• Nombre: ${ORD.ship.name.trim()||'—'}\n• Dirección: ${ORD.ship.addr.trim()||'—'}\n• Teléfono: ${ORD.ship.phone.trim()||'—'}\n\nTe mando mi ficha técnica 📎\n(La armé en ${BRAND.site.replace('https://','')})`}
function openOrder(step=0,from){closeDrawer();coachClear();closeBookMenu();const back=curScreen();if(back!=='order')ORD.back=back;if(from){Object.assign(ORD,from);ORD.code=null}ORD.step=step;go('order');renderOrder();$('#ordRoot').scrollTop=0}
/* map any digital agenda to the closest thing that can be ordered */
function orderFromAgenda(a){const near=(list,hex)=>{const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]},[r,g,b]=rgb(hex);return list.reduce((best,x)=>{const[R,G,B]=rgb(x[2]),d=(R-r)**2+(G-g)**2+(B-b)**2;return d<best[1]?[x[0],d]:best},['',1e9])[0]};
  const ch=(a.cover.charms||[])[0];
  return{size:a.size==='a6'?'a6':'a5',leather:isTornasol(a.cover)?'tornasol':near(DL_LEATHERS,a.cover.color),elastic:near(DL_ELASTICS,a.cover.elastic.color),charm:ch?(DL_CHARMS.some(x=>x[0]===ch.shape)?ch.shape:'concha'):'none'}}

/* la libreta abierta: el cuero extendido y el librito que elijas encima, con su tipo de hoja */
function insideHTML(w){const a=orderAgenda(),[W,H]=dims(a),bw=Math.round(w*1.05*W/560),bh=Math.round(bw*H/W),ins=orderInserts(),k=ORD.bk,lc=dlPick(DL_LEATHERS,ORD.leather)[2];
  const leaf=(t,side)=>`<div class="in-pg pp-${t} ${side}"></div>`;
  return `<div class="ord-inside" style="--bw:${bw}px;--bh:${bh}px">
   <div class="in-sp" style="background:${swBg(lc)}">${isTornasol({color:lc})?'<i class="iris"></i>':''}<span class="in-rv l"></span><span class="in-rv r"></span>
    <div class="in-stack">${[2,1].map(d=>`<div class="in-under d${d}"></div>`).join('')}<div class="in-book">${leaf(ins[k],'l')}${leaf(ins[k],'r')}<span class="in-fold"></span></div></div></div>
   <div class="in-tabs" role="tablist" aria-label="Libritos">${ins.map((t,i)=>`<button type="button" role="tab" aria-selected="${i===k}" class="${i===k?'on':''}" data-bk="${i}"><b>${i+1}</b>${insName(t)}</button>`).join('')}</div></div>`}
function stageHTML(bw){const open=ORD.step===2||ORD.view==='open';
  return `${open?insideHTML(bw):ordPreview(bw)}<div class="ord-stage-ft">${open?'':'<span class="ord-drag">arrastrá para girarla</span>'}${ORD.step===2?'':`<button type="button" class="ord-view" id="ordView">${open?'Ver cerrada':'Ver por dentro ✦'}</button>`}</div>`}
function ordPreview(w){const a=orderAgenda();return `<div class="ord-book" style="--sway:${ORD.ry}deg">${book3D(a,Math.round(w*dims(a)[0]/560),{ry:ORD.ry,rx:7})}</div>`}
const charmThumb=id=>id==='none'?'<i class="nocharm">—</i>':`<img src="${CHARM_PHOTOS[id].src}" alt="" loading="lazy">`;
/* what she has picked so far: always visible, tap a chip to go back to that step */
function ordPick(){const s=ORD.step,l=dlPick(DL_LEATHERS,ORD.leather),e=dlPick(DL_ELASTICS,ORD.elastic),c=dlPick(DL_CHARMS,ORD.charm),z=dlPick(DL_SIZES,ORD.size);
  const chip=(n,inner,label)=>`<button type="button" class="pk${s===n?' cur':''}" data-goto="${n}" aria-label="Cambiar ${label}">${inner}</button>`;
  const ins=orderInserts(),insShort=ORD.size==='a6'?'3 blancos':ins.every(x=>x===ins[0])?'3 '+insName(ins[0]).toLowerCase():ins.map(x=>insName(x)[0]).join('·');
  return `<div class="ord-pick" role="group" aria-label="Tu Delulu hasta ahora">${chip(1,`<b>${z[1]}</b>`,'tamaño')}${chip(2,`<span class="pk-in">${ins.map(t=>`<i class="pp-${t}"></i>`).join('')}</span>${insShort}`,'lo de adentro')}${chip(3,`<i style="background:${swBg(l[2])}"></i>${l[1]}`,'cuero')}${chip(4,`<i style="background:${e[2]}"></i>${e[1]}`,'elástico')}${chip(5,`<span class="pk-c">${charmThumb(ORD.charm)}</span>${c[1]}`,'charm')}<span class="pk-q">${qz(orderTotal())}</span><button type="button" class="pk-rand" id="ordRand" title="Armar una combinación al azar">✦ Sorprendeme</button></div>`}
function refreshPick(){const p=$('.ord-pick',ordRoot);if(p)p.outerHTML=ordPick()}
function surprise(){const r=l=>l[Math.floor(Math.random()*l.length)][0];ORD.leather=r(DL_LEATHERS);ORD.elastic=r(DL_ELASTICS);ORD.charm=r(DL_CHARMS.filter(x=>x[0]!=='none'));ORD.ins5=[0,1,2].map(()=>r(DL_INSERTS));if(ORD.step===0)ORD.size=r(DL_SIZES);ORD.code=null}
const ordSw=(k,list)=>`<div class="ord-sw" role="radiogroup">${list.map(([id,n,c])=>`<button type="button" role="radio" aria-checked="${ORD[k]===id}" class="${ORD[k]===id?'on':''}" data-o="${k}" data-v="${id}"><i style="background:${swBg(c)}"></i><span>${n}</span></button>`).join('')}</div>`;
function renderOrder(){const s=ORD.step,st=ORD_STEPS[s],root=$('#ordRoot'),wide=innerWidth>860,bw=wide?250:150;
  let head='',body='',note='';
  if(s===0){head=`<div class="ord-logo">${brandLogo('xl')}</div><h2>¿Cómo armo mi <em>Delulu</em>?</h2><p class="ord-hand">en 5 pasitos ✦</p>`;
    body=`<p class="ord-steps">TAMAÑO <b>✦</b> POR DENTRO <b>✦</b> CUERO <b>✦</b> ELÁSTICO <b>✦</b> CHARM</p><p class="ord-p">Cuero artesanal, hecho a mano en Guatemala. Armala acá, mirala en 3D, descargá tu ficha y mandala por DM.</p>
    <p class="ord-price">${DL_SIZES.map(z=>`${z[1]} <b>${qz(z[4])}</b>`).join(' <i>·</i> ')} <i>·</i> envío ${qz(DL_SHIP)}</p>
    <button type="button" class="ord-rand0" id="ordRand">✦ Sorprendeme con una combinación</button>`}
  if(s===1){head=`<p class="ord-hand">paso 01</p><h2>Elegí el <em>tamaño</em></h2>`;
    body=`<div class="ord-sizes">${DL_SIZES.map(([id,l,d,t])=>{const a=orderAgenda({...ORD,size:id});return `<button type="button" class="ord-size${ORD.size===id?' on':''}" data-o="size" data-v="${id}" aria-pressed="${ORD.size===id}"><span class="sz-b">${book3D(a,Math.round((wide?120:84)*dims(a)[0]/560),{ry:20,rx:5})}</span><b>${l}</b><small>${d.toUpperCase()}</small><span class="ord-hand sm">${t}</span><span class="sz-q">${qz(DL_SIZES.find(x=>x[0]===id)[4])}</span></button>`}).join('')}</div><p class="ord-ship">+ ${qz(DL_SHIP)} de envío</p>`}
  if(s===2){head=`<p class="ord-hand">paso 02</p><h2>¿Cómo la querés <em>por dentro</em>?</h2>`;
    body=ORD.size==='a6'?`<p class="ord-p">Tu <b>A6</b> trae <b>3 libritos de hojas blancas</b>: perfectos para dibujar, pegar y llevar a todos lados.</p><div class="ord-ins a6">${[0,1,2].map(i=>`<div class="ins-row"><span>Librito ${i+1}</span><em class="pp-tag"><i class="pp-blancas"></i>Blancas</em></div>`).join('')}</div>`
     :`<p class="ord-p">Tu <b>A5</b> trae <b>3 libritos</b>. Elegí cómo querés las hojas de cada uno:</p><div class="ord-ins">${ORD.ins5.map((t,i)=>`<div class="ins-row"><span>Librito ${i+1}</span><div class="ins-seg" role="radiogroup" aria-label="Hojas del librito ${i+1}">${DL_INSERTS.map(([id,n])=>`<button type="button" role="radio" aria-checked="${t===id}" class="${t===id?'on':''}" data-ins="${i}" data-v="${id}"><i class="pp-${id}"></i>${n}</button>`).join('')}</div></div>`).join('')}</div>`;
    note=ORD.size==='a6'?'':'tocá cada librito en la libreta para verlo por dentro ✦'}
  if(s===3){head=`<p class="ord-hand">paso 03</p><h2>Elegí el <em>color</em><br>del cuero</h2>`;body=ordSw('leather',DL_LEATHERS)}
  if(s===4){head=`<p class="ord-hand">paso 04</p><h2>Elegí tu <em>elástico</em></h2>`;body=ordSw('elastic',DL_ELASTICS);note='combinalo con tu cuero o hacé contraste — acá se vale ser delulu ✦'}
  if(s===5){head=`<p class="ord-hand">paso 05</p><h2>Y por último…<br>tu <em>charm</em></h2>`;
    body=`<div class="ord-charms" role="radiogroup">${DL_CHARMS.map(([id,n])=>`<button type="button" role="radio" aria-checked="${ORD.charm===id}" class="${ORD.charm===id?'on':''}" data-o="charm" data-v="${id}">${charmThumb(id)}<span>${n}</span></button>`).join('')}</div>
`;note='El detallito que la hace <em>100% tuya.</em>'}
  if(s===ORD_LAST){orderCode();const rows=orderRows();
    head=`<p class="ord-hand">y así nace tu</p><h2><em>Delulu</em> Journal</h2>`;
    body=`<div class="ord-card"><span class="ord-cap">TU PEDIDO <b>N.º ${ORD.code}</b></span>${rows.map(([k,v,go])=>`<button type="button" class="ord-row" data-goto="${go}" title="Cambiar"><i class="ck">✓</i><span>${k}</span><em>${esc(v)}</em></button>`).join('')}
      <div class="ord-sum"><span>Libreta ${dlPick(DL_SIZES,ORD.size)[1]}</span><em>${qz(orderPrice())}</em><span>Envío</span><em>${qz(DL_SHIP)}</em><b>Total</b><b>${qz(orderTotal())}</b></div></div>
     <div class="ord-ship-f" id="ordShip"><span class="ord-cap">DATOS DE ENTREGA</span>
      <label><span>Nombre completo</span><input id="shName" data-f="name" autocomplete="name" maxlength="60" placeholder="Ej. Sofía Morales" value="${esc(ORD.ship.name)}"></label>
      <label><span>Dirección de entrega</span><textarea id="shAddr" data-f="addr" autocomplete="street-address" rows="2" maxlength="160" placeholder="Calle, número, zona, ciudad y departamento">${esc(ORD.ship.addr)}</textarea></label>
      <label><span>Teléfono</span><input id="shPhone" data-f="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="Ej. 5555 1234" value="${esc(ORD.ship.phone)}"></label>
      <small>Solo se usan para tu envío y van en tu ficha.</small></div>
     <ol class="ord-how"><li><b>Descargá tu ficha técnica</b>: es una imagen con todo tu pedido.</li><li><b>Mandánosla por DM</b> a @${BRAND.ig} y te confirmamos.</li></ol>
     <button type="button" class="ord-dm" id="ordDL">${ico('dl')}DESCARGAR MI FICHA</button>
     <a class="ord-dm2" href="${BRAND.dm}" target="_blank" rel="noopener" id="ordDM">PEDIDOS POR DM →</a>
     <div class="ord-more"><button type="button" class="btn sm" id="ordFicha">${ico('image')}Ver mi ficha</button><button type="button" class="btn sm" id="ordCopy">${ico('copy')}Copiar mi pedido</button></div>
     <p class="ord-ig">@${BRAND.ig.toUpperCase()}</p>`}
  const dots=ORD_STEPS.map((_,i)=>`<i class="${i===s?'on':''}"></i>`).join('');
  root.className='ord s-'+st.bg;
  root.innerHTML=`<header class="ord-top">${s?`<button type="button" class="ord-x" id="ordClose">${ico('back')}<span>Inicio</span></button>`:'<b class="ord-ph"></b>'}<span class="ord-eb">DELULU JOURNAL</span><span class="ord-eb">${s===0?'CÓMO COMPRAR':s===ORD_LAST?'¡LISTO!':`PASO ${s} DE ${ORD_N}`}</span></header>
   <div class="ord-main"><div class="ord-stage" id="ordStage"><span class="corner tl"></span><span class="corner br"></span><span class="star a">★</span><span class="star b">★</span>${stageHTML(bw)}</div>
    <div class="ord-copy">${s>=1&&s<ORD_LAST?ordPick():''}${head}${body}${note?`<p class="ord-note">${note}</p>`:''}</div></div>
   <footer class="ord-nav">${s>0?`<button type="button" class="btn" id="ordPrev">${ico('left')}Atrás</button>`:'<span></span>'}<div class="ord-dots" aria-hidden="true">${dots}</div>${s<ORD_LAST?`<button type="button" class="btn ord-next" id="ordNext">${s===0?'Empezar':s===ORD_N?'Ver mi pedido':'Siguiente'} →</button>`:`<button type="button" class="btn" id="ordAgain">Armar otra</button>`}</footer>`}
function refreshPreview(){const st=$('#ordStage');if(st)st.innerHTML=`<span class="corner tl"></span><span class="corner br"></span><span class="star a">★</span><span class="star b">★</span>${stageHTML(innerWidth>860?250:150)}`}

const ordRoot=$('#ordRoot');
ordRoot.addEventListener('click',async e=>{const t=e.target;
  if(t.closest('#ordClose')){ORD.step=0;renderOrder();scrollTo(0,0);$('#order').scrollTop=0;return}
  if(t.closest('#ordNext')){ORD.step=Math.min(ORD_LAST,ORD.step+1);renderOrder();ordRoot.scrollTop=0;return}
  if(t.closest('#ordPrev')){ORD.step=Math.max(0,ORD.step-1);renderOrder();return}
  if(t.closest('#ordAgain')){ORD.step=1;ORD.code=null;renderOrder();return}
  if(t.closest('#ordView')){ORD.view=ORD.view==='open'?'closed':'open';refreshPreview();return}
  const bk=t.closest('[data-bk]');if(bk){ORD.bk=+bk.dataset.bk;refreshPreview();return}
  const ins=t.closest('[data-ins]');if(ins){const i=+ins.dataset.ins;ORD.ins5[i]=ins.dataset.v;ORD.bk=i;ORD.code=null;$$(`[data-ins="${i}"]`,ordRoot).forEach(x=>{const on=x===ins;x.classList.toggle('on',on);x.setAttribute('aria-checked',on)});refreshPreview();refreshPick();return}
  const g=t.closest('[data-goto]');if(g){ORD.step=+g.dataset.goto;renderOrder();return}
  if(t.closest('#ordRand')){surprise();if(ORD.step===0)ORD.step=ORD_LAST;renderOrder();const b=$('#ordStage .b3');b?.animate?.([{transform:'scale(.92)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:420,easing:'ease-out'});toast('¡Así sería tu Delulu! Cambiá lo que quieras ✦');return}
  const o=t.closest('[data-o]');if(o){ORD[o.dataset.o]=o.dataset.v;ORD.code=null;if(o.dataset.o==='size')renderOrder();else{$$(`[data-o="${o.dataset.o}"]`,ordRoot).forEach(x=>{x.classList.toggle('on',x===o);x.setAttribute('aria-checked',x===o)});refreshPreview();refreshPick()}return}
  if(t.closest('#ordCopy')){const txt=orderText();try{await navigator.clipboard.writeText(txt);toast('Pedido copiado. Pegalo en el DM')}catch(_){showOrderText(txt)}return}
  if(t.closest('#ordFicha')){openFicha();return}
  if(t.closest('#ordDL')){const b=t.closest('#ordDL');if(b.disabled)return;const miss=shipMissing();if(miss){const inp=$(`[data-f="${miss}"]`,ordRoot);inp.classList.add('bad');inp.focus();inp.scrollIntoView({block:'center',behavior:'smooth'});toast(`Completá tu ${SHIP_FIELDS.find(f=>f[0]===miss)[1].toLowerCase()} para descargar la ficha`);return}b.disabled=true;try{await saveFicha();toast('Ficha descargada ✦ Ahora mandala por DM',{ms:6000})}catch(err){toast(err?.message||'No se pudo descargar la ficha')}finally{b.disabled=false}return}
  if(t.closest('#ordDM')){const txt=orderText();try{await navigator.clipboard.writeText(txt);toast('Copiamos tu pedido: pegalo en el chat y adjuntá tu ficha',{ms:7000})}catch(_){}return}});
ordRoot.addEventListener('input',e=>{const f=e.target.dataset?.f;if(!f)return;ORD.ship[f]=e.target.value;e.target.classList.remove('bad');saveShip()});
/* drag the preview to turn the notebook */
ordRoot.addEventListener('pointerdown',e=>{const st=e.target.closest('#ordStage');if(!st||e.target.closest('button'))return;const b=$('.b3',st);if(!b)return;e.preventDefault();const x0=e.clientX,r0=ORD.ry;st.classList.add('dragging');
  const mv=m=>{ORD.ry=r0+(m.clientX-x0)*.6;b.style.setProperty('--ry',ORD.ry+'deg')};const up=()=>{document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);st.classList.remove('dragging')};
  document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up)});
addEventListener('resize',()=>{if($('#order').classList.contains('show'))renderOrder()});
function showOrderText(txt){const m=modal(`<header><h2>Tu pedido</h2><div class="spacer"></div><button class="btn ghost icon" data-x aria-label="Cerrar">${ico('x')}</button></header>
  <div class="content one"><p class="hint" style="margin:0">Copiá este texto y mandalo por DM a <b>@${BRAND.ig}</b> en Instagram.</p><textarea readonly rows="7" id="ordTxt" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--panel-2);color:var(--ink)">${esc(txt)}</textarea></div>
  <footer><button class="btn primary" data-x>Listo</button></footer>`,'sm');const ta=$('#ordTxt',m);ta.focus();ta.select();m.addEventListener('click',e=>{if(e.target.closest('[data-x]'))m.remove()})}
