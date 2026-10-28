
/* ================= "Pedí tu libreta": build a real Delulu step by step and order it by DM ================= */
const ORD={step:0,size:'a5',leather:'cafe',elastic:'azul',charm:'croissant',ry:24};
const ORD_STEPS=[{bg:'green'},{bg:'cream',n:'01'},{bg:'green',n:'02'},{bg:'pink',n:'03'},{bg:'cream',n:'04'},{bg:'green'}];
const dlPick=(list,id)=>list.find(x=>x[0]===id)||list[0];
/* the notebook being ordered, as a digital agenda (used for the 3D preview and "crear en digital") */
function orderAgenda(o=ORD){const lc=dlPick(DL_LEATHERS,o.leather)[2],ec=dlPick(DL_ELASTICS,o.elastic)[2];
  const a=newAgenda({name:'Mi Delulu',type:'blank',size:o.size,color:lc,elastic:ec,charm:o.charm,noTitle:true});
  a.pages=Array.from({length:8},()=>pg('lines'));return a}
function orderCode(){if(!ORD.code){const d=new Date(),p=n=>String(n).padStart(2,'0'),abc='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=crypto.getRandomValues(new Uint8Array(3));
  ORD.code=`DJ-${String(d.getFullYear()).slice(2)}${p(d.getMonth()+1)}${p(d.getDate())}-${[...r].map(x=>abc[x%abc.length]).join('')}`;ORD.date=d}return ORD.code}
function orderRows(){const s=dlPick(DL_SIZES,ORD.size),l=dlPick(DL_LEATHERS,ORD.leather),e=dlPick(DL_ELASTICS,ORD.elastic),c=dlPick(DL_CHARMS,ORD.charm);
  return[['Tamaño',`${s[1]} · ${s[2]}`,1],['Color del cuero',l[1],2],['Color del elástico',e[1],3],['Charm',c[1],4]]}
function orderText(){return `¡Hola! Quiero mi Delulu Journal ✦\nPedido N.º ${orderCode()}\n${orderRows().map(([k,v])=>`• ${k}: ${v}`).join('\n')}\nTe mando mi ficha técnica 📎\n(La armé en ${BRAND.site.replace('https://','')})`}
function openOrder(step=0,from){closeDrawer();coachClear();closeBookMenu();const back=curScreen();if(back!=='order')ORD.back=back;if(from){Object.assign(ORD,from);ORD.code=null}ORD.step=step;go('order');renderOrder();$('#ordRoot').scrollTop=0}
/* map any digital agenda to the closest thing that can be ordered */
function orderFromAgenda(a){const near=(list,hex)=>{const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]},[r,g,b]=rgb(hex);return list.reduce((best,x)=>{const[R,G,B]=rgb(x[2]),d=(R-r)**2+(G-g)**2+(B-b)**2;return d<best[1]?[x[0],d]:best},['',1e9])[0]};
  const ch=(a.cover.charms||[])[0];
  return{size:a.size==='a6'?'a6':'a5',leather:isTornasol(a.cover)?'tornasol':near(DL_LEATHERS,a.cover.color),elastic:near(DL_ELASTICS,a.cover.elastic.color),charm:ch?(DL_CHARMS.some(x=>x[0]===ch.shape)?ch.shape:'croissant'):'none'}}

function ordPreview(w){const a=orderAgenda();return `<div class="ord-book" style="--sway:${ORD.ry}deg">${book3D(a,Math.round(w*dims(a)[0]/560),{ry:ORD.ry,rx:7})}</div>`}
const ordSw=(k,list)=>`<div class="ord-sw" role="radiogroup">${list.map(([id,n,c])=>`<button type="button" role="radio" aria-checked="${ORD[k]===id}" class="${ORD[k]===id?'on':''}" data-o="${k}" data-v="${id}"><i style="background:${swBg(c)}"></i><span>${n}</span></button>`).join('')}</div>`;
function renderOrder(){const s=ORD.step,st=ORD_STEPS[s],root=$('#ordRoot'),wide=innerWidth>860,bw=wide?250:150;
  let head='',body='',note='';
  if(s===0){head=`<div class="ord-logo">${brandLogo('xl')}</div><h2>¿Cómo armo mi <em>Delulu</em>?</h2><p class="ord-hand">en 4 pasitos ✦</p>`;
    body=`<p class="ord-steps">TAMAÑO <b>✦</b> COLOR <b>✦</b> ELÁSTICO <b>✦</b> CHARM</p><p class="ord-p">Cuero artesanal, hecho a mano en Guatemala. Armala acá, mirala en 3D, descargá tu ficha y mandala por DM.</p>`}
  if(s===1){head=`<p class="ord-hand">paso 01</p><h2>Elegí el <em>tamaño</em></h2>`;
    body=`<div class="ord-sizes">${DL_SIZES.map(([id,l,d,t])=>{const a=orderAgenda({...ORD,size:id});return `<button type="button" class="ord-size${ORD.size===id?' on':''}" data-o="size" data-v="${id}" aria-pressed="${ORD.size===id}"><span class="sz-b">${book3D(a,Math.round((wide?120:84)*dims(a)[0]/560),{ry:20,rx:5})}</span><b>${l}</b><small>${d.toUpperCase()}</small><span class="ord-hand sm">${t}</span></button>`}).join('')}</div>`}
  if(s===2){head=`<p class="ord-hand">paso 02</p><h2>Elegí el <em>color</em><br>del cuero</h2>`;body=ordSw('leather',DL_LEATHERS)}
  if(s===3){head=`<p class="ord-hand">paso 03</p><h2>Elegí tu <em>elástico</em></h2>`;body=ordSw('elastic',DL_ELASTICS);note='combinalo con tu cuero o hacé contraste — acá se vale ser delulu ✦'}
  if(s===4){head=`<p class="ord-hand">paso 04</p><h2>Y por último…<br>tu <em>charm</em></h2>`;
    body=`<div class="ord-charms" role="radiogroup">${DL_CHARMS.map(([id,n])=>`<button type="button" role="radio" aria-checked="${ORD.charm===id}" class="${ORD.charm===id?'on':''}" data-o="charm" data-v="${id}">${id==='none'?'<i class="nocharm">—</i>':charmSVG({shape:id,material:'oro',color:'#c4878c',letter:'D'},30)}<span>${n}</span></button>`).join('')}</div>
`;note='El detallito que la hace <em>100% tuya.</em>'}
  if(s===5){orderCode();const rows=orderRows();
    head=`<p class="ord-hand">y así nace tu</p><h2><em>Delulu</em> Journal</h2>`;
    body=`<div class="ord-card"><span class="ord-cap">TU PEDIDO <b>N.º ${ORD.code}</b></span>${rows.map(([k,v,go])=>`<button type="button" class="ord-row" data-goto="${go}" title="Cambiar"><i class="ck">✓</i><span>${k}</span><em>${esc(v)}</em></button>`).join('')}</div>
     <ol class="ord-how"><li><b>Descargá tu ficha técnica</b>: es una imagen con todo tu pedido.</li><li><b>Mandánosla por DM</b> a @${BRAND.ig} y te confirmamos.</li></ol>
     <button type="button" class="ord-dm" id="ordDL">${ico('dl')}DESCARGAR MI FICHA</button>
     <a class="ord-dm2" href="${BRAND.dm}" target="_blank" rel="noopener" id="ordDM">PEDIDOS POR DM →</a>
     <div class="ord-more"><button type="button" class="btn sm" id="ordFicha">${ico('image')}Ver mi ficha</button><button type="button" class="btn sm" id="ordCopy">${ico('copy')}Copiar mi pedido</button></div>
     <p class="ord-ig">@${BRAND.ig.toUpperCase()}</p>`}
  const dots=ORD_STEPS.map((_,i)=>`<i class="${i===s?'on':''}"></i>`).join('');
  root.className='ord s-'+st.bg;
  root.innerHTML=`<header class="ord-top">${s?`<button type="button" class="ord-x" id="ordClose">${ico('back')}<span>Inicio</span></button>`:'<b class="ord-ph"></b>'}<span class="ord-eb">DELULU JOURNAL</span><span class="ord-eb">${s===0?'CÓMO COMPRAR':s===5?'¡LISTO!':`PASO ${s} DE 4`}</span></header>
   <div class="ord-main"><div class="ord-stage" id="ordStage"><span class="corner tl"></span><span class="corner br"></span><span class="star a">★</span><span class="star b">★</span>${ordPreview(bw)}<span class="ord-drag">arrastrá para girarla</span></div>
    <div class="ord-copy">${head}${body}${note?`<p class="ord-note">${note}</p>`:''}</div></div>
   <footer class="ord-nav">${s>0?`<button type="button" class="btn" id="ordPrev">${ico('left')}Atrás</button>`:'<span></span>'}<div class="ord-dots" aria-hidden="true">${dots}</div>${s<5?`<button type="button" class="btn ord-next" id="ordNext">${s===0?'Empezar':s===4?'Ver mi pedido':'Siguiente'} →</button>`:`<button type="button" class="btn" id="ordAgain">Armar otra</button>`}</footer>`}
function refreshPreview(){const st=$('#ordStage .ord-book');if(st)st.outerHTML=ordPreview(innerWidth>860?250:150)}

const ordRoot=$('#ordRoot');
ordRoot.addEventListener('click',async e=>{const t=e.target;
  if(t.closest('#ordClose')){ORD.step=0;renderOrder();scrollTo(0,0);$('#order').scrollTop=0;return}
  if(t.closest('#ordNext')){ORD.step=Math.min(5,ORD.step+1);renderOrder();ordRoot.scrollTop=0;return}
  if(t.closest('#ordPrev')){ORD.step=Math.max(0,ORD.step-1);renderOrder();return}
  if(t.closest('#ordAgain')){ORD.step=1;ORD.code=null;renderOrder();return}
  const g=t.closest('[data-goto]');if(g){ORD.step=+g.dataset.goto;renderOrder();return}
  const o=t.closest('[data-o]');if(o){ORD[o.dataset.o]=o.dataset.v;ORD.code=null;if(o.dataset.o==='size')renderOrder();else{$$(`[data-o="${o.dataset.o}"]`,ordRoot).forEach(x=>{x.classList.toggle('on',x===o);x.setAttribute('aria-checked',x===o)});refreshPreview()}return}
  if(t.closest('#ordCopy')){const txt=orderText();try{await navigator.clipboard.writeText(txt);toast('Pedido copiado. Pegalo en el DM')}catch(_){showOrderText(txt)}return}
  if(t.closest('#ordFicha')){openFicha();return}
  if(t.closest('#ordDL')){const b=t.closest('#ordDL');if(b.disabled)return;b.disabled=true;try{await saveFicha();toast('Ficha descargada ✦ Ahora mandala por DM',{ms:6000})}catch(err){toast(err?.message||'No se pudo descargar la ficha')}finally{b.disabled=false}return}
  if(t.closest('#ordDM')){const txt=orderText();try{await navigator.clipboard.writeText(txt);toast('Copiamos tu pedido: pegalo en el chat y adjuntá tu ficha',{ms:7000})}catch(_){}return}});
/* drag the preview to turn the notebook */
ordRoot.addEventListener('pointerdown',e=>{const st=e.target.closest('#ordStage');if(!st)return;const b=$('.b3',st);if(!b)return;e.preventDefault();const x0=e.clientX,r0=ORD.ry;st.classList.add('dragging');
  const mv=m=>{ORD.ry=r0+(m.clientX-x0)*.6;b.style.setProperty('--ry',ORD.ry+'deg')};const up=()=>{document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);st.classList.remove('dragging')};
  document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up)});
addEventListener('resize',()=>{if($('#order').classList.contains('show'))renderOrder()});
function showOrderText(txt){const m=modal(`<header><h2>Tu pedido</h2><div class="spacer"></div><button class="btn ghost icon" data-x aria-label="Cerrar">${ico('x')}</button></header>
  <div class="content one"><p class="hint" style="margin:0">Copiá este texto y mandalo por DM a <b>@${BRAND.ig}</b> en Instagram.</p><textarea readonly rows="7" id="ordTxt" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--panel-2);color:var(--ink)">${esc(txt)}</textarea></div>
  <footer><button class="btn primary" data-x>Listo</button></footer>`,'sm');const ta=$('#ordTxt',m);ta.focus();ta.select();m.addEventListener('click',e=>{if(e.target.closest('[data-x]'))m.remove()})}
