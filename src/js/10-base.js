
/* ================= utilities ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ico=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
function toast(msg,o={}){$$('.toast').forEach(t=>t.remove());const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');
  t.innerHTML=`<span>${esc(msg)}</span>${o.action?`<button type="button">${esc(o.action)}</button>`:''}`;document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('in'));
  let done=false;const close=undone=>{if(done)return;done=true;t.classList.remove('in');setTimeout(()=>t.remove(),300);if(!undone)o.after?.()};
  if(o.action)t.querySelector('button').onclick=()=>{close(true);o.fn()};setTimeout(()=>close(false),o.ms||(o.action?6000:2400))}
function ago(ts){const s=(Date.now()-ts)/1000;if(s<60)return'editada hace un momento';if(s<3600)return`editada hace ${Math.round(s/60)} min`;if(s<86400)return`editada hace ${Math.round(s/3600)} h`;const d=Math.round(s/86400);return d===1?'editada ayer':`editada hace ${d} días`}
function shade(hex,amt){let c=hex.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');let n=parseInt(c,16),r=n>>16,g=n>>8&255,b=n&255;const f=v=>clamp(Math.round(amt<0?v*(1+amt):v+(255-v)*amt),0,255);return'#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}

let SHARED_IMG={},LPC=0;
const imgURL=id=>(id&&SHARED_IMG[id])||((S&&S.images)||{})[id]||'';
const MASK_PATHS=(()=>{const f=v=>v.toFixed(4);
  const star=(n,ri)=>{let d='';for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,r=i%2?ri:.5;d+=(i?'L':'M')+f(.5+r*Math.cos(a))+' '+f(.52+r*Math.sin(a))}return d+'Z'};
  const scallop=()=>{const n=14,R=.44;let d='';for(let i=0;i<n;i++){const a0=i/n*2*Math.PI,a1=(i+1)/n*2*Math.PI,am=(a0+a1)/2;if(!i)d+=`M${f(.5+R*Math.cos(a0))} ${f(.5+R*Math.sin(a0))}`;d+=`Q${f(.5+.56*Math.cos(am))} ${f(.5+.56*Math.sin(am))} ${f(.5+R*Math.cos(a1))} ${f(.5+R*Math.sin(a1))}`}return d+'Z'};
  const hex=()=>{let d='';for(let i=0;i<6;i++){const a=i*Math.PI/3;d+=(i?'L':'M')+f(.5+.5*Math.cos(a))+' '+f(.5+.5*Math.sin(a))}return d+'Z'};
  return{circle:'M0.5 0A0.5 0.5 0 1 1 0.5 1A0.5 0.5 0 1 1 0.5 0Z',
    heart:'M0.5 0.96C0.16 0.72 0 0.5 0.03 0.29C0.06 0.08 0.32 0 0.5 0.2C0.68 0 0.94 0.08 0.97 0.29C1 0.5 0.84 0.72 0.5 0.96Z',
    star:star(5,.24),arch:'M0 1L0 0.5C0 0.22 0.22 0 0.5 0C0.78 0 1 0.22 1 0.5L1 1Z',scallop:scallop(),hex:hex(),
    blob:'M0.52 0.02C0.75 0 0.96 0.16 0.98 0.42C1 0.66 0.88 0.9 0.62 0.97C0.38 1.02 0.1 0.9 0.03 0.64C-0.02 0.4 0.08 0.2 0.25 0.1C0.33 0.05 0.42 0.03 0.52 0.02Z'}})();
document.body.insertAdjacentHTML('beforeend',`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${Object.entries(MASK_PATHS).map(([k,d])=>`<clipPath id="cp-${k}" clipPathUnits="objectBoundingBox"><path d="${d}"/></clipPath>`).join('')}</defs></svg>`);
const maskOf=e=>e.mask&&e.mask!=='none'?e.mask:(e.frame==='circulo'?'circle':null);

/* ================= persistence (IndexedDB, falls back to localStorage) ================= */
const DB={db:null,
  open(){return new Promise(res=>{try{const rq=indexedDB.open('journaly',1);rq.onupgradeneeded=()=>rq.result.createObjectStore('kv');rq.onsuccess=()=>{this.db=rq.result;res(true)};rq.onerror=()=>res(false)}catch(e){res(false)}})},
  get(k){return new Promise(res=>{if(!this.db){try{res(JSON.parse(localStorage.getItem('journaly-'+k)))}catch(e){res(null)}return}
    try{const rq=this.db.transaction('kv').objectStore('kv').get(k);rq.onsuccess=()=>res(rq.result??null);rq.onerror=()=>res(null)}catch(e){res(null)}})},
  set(k,v){return new Promise((res,rej)=>{if(!this.db){try{localStorage.setItem('journaly-'+k,JSON.stringify(v));res()}catch(e){rej(e)}return}
    try{const tx=this.db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)}catch(e){rej(e)}})},
  del(k){return new Promise(res=>{if(!this.db){try{localStorage.removeItem('journaly-'+k)}catch(e){}res();return}
    try{const tx=this.db.transaction('kv','readwrite');tx.objectStore('kv').delete(k);tx.oncomplete=tx.onerror=tx.onabort=()=>res()}catch(e){res()}})}
};
/* Photos and stickers are stored one record each, so an edit never rewrites every photo. */
function imageStore(init){return new Proxy(Object.assign({},init),{
  set(o,k,v){o[k]=v;DB.set('img:'+k,v).catch(()=>setSave('err','No se pudo guardar la foto. Libera espacio y vuelve a intentar.'));return true},
  deleteProperty(o,k){delete o[k];DB.del('img:'+k);return true}})}
const diskState=()=>({...S,images:undefined,imgIds:Object.keys(S.images)});
let S=null; // app state
let saveTimer=null;
function setSave(st,msg){const el=$('#saveState');el.className='save'+(st==='busy'?' busy':st==='err'?' err':'');el.querySelector('span').textContent=msg}
function persist(){setSave('busy','Guardando…');clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{
  try{await DB.set('state',diskState());setSave('ok','Guardado')}catch(e){setSave('err','No se pudo guardar: libera espacio o quita fotos grandes')}},500)}
window.addEventListener('beforeunload',()=>{if(saveTimer){try{DB.set('state',diskState())}catch(e){}}});

/* ================= resource library ================= */
const W='stroke="#fff" stroke-width="5" stroke-linejoin="round" paint-order="stroke"';
const STICKERS=[
 {id:'heart',n:'Corazón',c:'corazones romántico',col:'#d9828b',s:c=>`<path ${W} fill="${c}" d="M50 86C12 62 6 33 25 21c13-8 22 0 25 9 3-9 12-17 25-9 19 12 13 41-25 65z"/><path d="M30 32c3-5 8-6 11-4" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`},
 {id:'star',n:'Estrella',c:'estrellas minimal',col:'#e3b75c',s:c=>`<path ${W} fill="${c}" d="M50 8l12 27 29 3-22 19 7 29-26-15-26 15 7-29L9 38l29-3z"/>`},
 {id:'sparkle',n:'Destello',c:'estrellas minimal',col:'#b8a4d6',s:c=>`<path ${W} fill="${c}" d="M50 6c4 26 18 40 44 44-26 4-40 18-44 44-4-26-18-40-44-44 26-4 40-18 44-44z"/>`},
 {id:'flower',n:'Flor',c:'flores botánico',col:'#e7a5a9',s:c=>`<g ${W}>${[0,72,144,216,288].map(a=>`<ellipse cx="50" cy="28" rx="15" ry="22" fill="${c}" transform="rotate(${a} 50 50)"/>`).join('')}</g><g fill="${c}">${[0,72,144,216,288].map(a=>`<ellipse cx="50" cy="28" rx="15" ry="22" transform="rotate(${a} 50 50)"/>`).join('')}</g><circle cx="50" cy="50" r="11" fill="#f2d27a"/>`},
 {id:'daisy',n:'Margarita',c:'flores botánico',col:'#ffffff',s:c=>`<circle cx="50" cy="50" r="44" fill="#fff" opacity=".0"/><g fill="${c}" stroke="#e6ddd0" stroke-width="1.5">${Array.from({length:12},(_,i)=>`<ellipse cx="50" cy="24" rx="7" ry="20" transform="rotate(${i*30} 50 50)"/>`).join('')}</g><circle cx="50" cy="50" r="12" fill="#e9b949"/>`},
 {id:'tulip',n:'Tulipán',c:'flores botánico romántico',col:'#d97b8a',s:c=>`<path d="M50 52v40" stroke="#7d9a6e" stroke-width="5"/><path d="M50 80c-14-4-22-14-24-26 12 2 20 10 24 26zM50 74c12-6 18-14 20-24-10 2-18 10-20 24z" fill="#8fae7f"/><path ${W} fill="${c}" d="M30 20l10 10 10-18 10 18 10-10c4 26-6 38-20 38S26 46 30 20z"/>`},
 {id:'sprig',n:'Rama',c:'botánico minimal',col:'#8fa67f',s:c=>`<path d="M20 88C40 60 60 36 82 12" stroke="${shade(c,-.25)}" stroke-width="3" fill="none"/><g fill="${c}">${[[30,72,-20],[40,60,30],[50,50,-25],[58,38,35],[68,28,-20],[76,18,30]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="11" ry="5" transform="rotate(${r} ${x} ${y})"/>`).join('')}</g>`},
 {id:'leaf',n:'Hoja',c:'botánico',col:'#a3b48f',s:c=>`<path ${W} fill="${c}" d="M18 82C14 40 42 14 86 14c0 44-26 72-68 68z"/><path d="M18 82L70 30" stroke="${shade(c,-.3)}" stroke-width="2.5"/>`},
 {id:'moon',n:'Luna',c:'estrellas minimal',col:'#efd690',s:c=>`<path ${W} fill="${c}" d="M62 10a40 40 0 1 0 28 62A34 34 0 0 1 62 10z"/>`},
 {id:'sun',n:'Sol',c:'minimal',col:'#efb85a',s:c=>`<g stroke="${c}" stroke-width="6" stroke-linecap="round">${Array.from({length:8},(_,i)=>`<path d="M50 8v10" transform="rotate(${i*45} 50 50)"/>`).join('')}</g><circle cx="50" cy="50" r="22" fill="${c}"/>`},
 {id:'cloud',n:'Nube',c:'kawaii minimal',col:'#e6e2ea',s:c=>`<path ${W} fill="${c}" d="M26 72a16 16 0 0 1 2-32 22 22 0 0 1 42-6 18 18 0 0 1 6 38z"/>`},
 {id:'cat',n:'Gato',c:'kawaii personajes',col:'#7d7470',s:c=>`<path ${W} fill="${c}" d="M18 30l8-20 16 14h16l16-14 8 20c6 10 6 22 0 32-8 14-22 20-32 20s-24-6-32-20c-6-10-6-22 0-32z"/><circle cx="37" cy="50" r="4" fill="#fff"/><circle cx="63" cy="50" r="4" fill="#fff"/><path d="M44 62q6 6 12 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 56h14M14 64l14-3M86 56H72M86 64l-14-3" stroke="#fff" stroke-width="2"/>`},
 {id:'bunny',n:'Conejo',c:'kawaii personajes',col:'#f1e4dc',s:c=>`<g ${W} fill="${c}"><ellipse cx="36" cy="28" rx="9" ry="22"/><ellipse cx="64" cy="28" rx="9" ry="22"/><ellipse cx="50" cy="62" rx="32" ry="26"/></g><ellipse cx="36" cy="28" rx="4" ry="15" fill="#f0b9be"/><ellipse cx="64" cy="28" rx="4" ry="15" fill="#f0b9be"/><circle cx="40" cy="60" r="3.5" fill="#4a3a33"/><circle cx="60" cy="60" r="3.5" fill="#4a3a33"/><circle cx="32" cy="68" r="5" fill="#f3b5b9" opacity=".7"/><circle cx="68" cy="68" r="5" fill="#f3b5b9" opacity=".7"/><path d="M47 67q3 3 6 0" stroke="#4a3a33" stroke-width="2" fill="none"/>`},
 {id:'happy',n:'Feliz',c:'emociones kawaii',col:'#f3cf6b',s:c=>`<circle ${W} cx="50" cy="50" r="40" fill="${c}"/><path d="M34 42q4-6 8 0M58 42q4-6 8 0" stroke="#4a3a33" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M34 58q16 16 32 0" stroke="#4a3a33" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="28" cy="56" r="5" fill="#ef9a91" opacity=".6"/><circle cx="72" cy="56" r="5" fill="#ef9a91" opacity=".6"/>`},
 {id:'love',n:'Enamorada',c:'emociones kawaii romántico',col:'#f6c27b',s:c=>`<circle ${W} cx="50" cy="50" r="40" fill="${c}"/><path d="M38 46c-8-5-8-12-3-13 2 0 3 1 3 3 0-2 1-3 3-3 5 1 5 8-3 13zM62 46c-8-5-8-12-3-13 2 0 3 1 3 3 0-2 1-3 3-3 5 1 5 8-3 13z" fill="#d9555f"/><path d="M38 60q12 10 24 0" stroke="#4a3a33" stroke-width="3.5" fill="none" stroke-linecap="round"/>`},
 {id:'sleepy',n:'Calma',c:'emociones',col:'#c9c2e3',s:c=>`<circle ${W} cx="50" cy="50" r="40" fill="${c}"/><path d="M32 46q6 5 12 0M56 46q6 5 12 0" stroke="#4a3a33" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M44 64h12" stroke="#4a3a33" stroke-width="3.5" stroke-linecap="round"/><text x="70" y="26" font-size="16" font-family="Figtree" fill="#4a3a33">z</text>`},
 {id:'butterfly',n:'Mariposa',c:'botánico romántico',col:'#a9b9db',s:c=>`<g ${W} fill="${c}"><path d="M50 50C36 18 10 16 12 36s24 18 38 14z"/><path d="M50 50C64 18 90 16 88 36s-24 18-38 14z"/><path d="M50 52C34 60 22 80 34 84s16-14 16-32z"/><path d="M50 52c16 8 28 28 16 32S50 70 50 52z"/></g><path d="M50 30v52" stroke="#4a3a33" stroke-width="4" stroke-linecap="round"/>`},
 {id:'cup',n:'Café',c:'vintage minimal',col:'#c7a688',s:c=>`<path ${W} fill="${c}" d="M18 38h52v20c0 16-12 26-26 26S18 74 18 58z"/><path d="M70 44h6a10 10 0 0 1 0 20h-8" stroke="${c}" stroke-width="6" fill="none"/><path d="M34 14q-6 8 0 14M46 12q-6 8 0 14" stroke="#b39a86" stroke-width="3" fill="none" stroke-linecap="round"/>`},
 {id:'stamp',n:'Sello postal',c:'vintage sellos',col:'#c97e6d',s:c=>{let d='';for(let i=0;i<9;i++){d+=`<circle cx="${14+i*9}" cy="12" r="3.4"/><circle cx="${14+i*9}" cy="88" r="3.4"/><circle cx="12" cy="${14+i*9}" r="3.4"/><circle cx="88" cy="${14+i*9}" r="3.4"/>`}
   return `<mask id="stm"><rect width="100" height="100" fill="#fff"/><g fill="#000">${d}</g></mask><rect x="8" y="8" width="84" height="84" fill="#fbf4e8" mask="url(#stm)"/><rect x="18" y="18" width="64" height="64" fill="${c}"/><path d="M28 70l14-22 10 14 8-10 12 18z" fill="#fbf4e8" opacity=".85"/><circle cx="64" cy="34" r="6" fill="#fbf4e8" opacity=".85"/><text x="22" y="30" font-size="10" font-family="Special Elite" fill="#fbf4e8">CORREO</text>`}},
 {id:'postmark',n:'Matasellos',c:'vintage sellos',col:'#6f5a7e',s:c=>`<g fill="none" stroke="${c}" opacity=".8"><circle cx="40" cy="50" r="30" stroke-width="3"/><circle cx="40" cy="50" r="23" stroke-width="1.5"/><path d="M70 38h28M70 46h28M70 54h28M70 62h28" stroke-width="3"/></g><text x="40" y="55" text-anchor="middle" font-size="13" font-family="Special Elite" fill="${c}" opacity=".85">2026</text>`},
 {id:'ticket',n:'Boleto',c:'vintage viajes',col:'#e9d3a7',s:c=>`<path ${W} fill="${c}" d="M6 28h88v14a8 8 0 0 0 0 16v14H6V58a8 8 0 0 0 0-16z"/><path d="M70 30v40" stroke="#9c8564" stroke-dasharray="3 3"/><text x="14" y="50" font-size="12" font-family="Special Elite" fill="#6d5a40">ADMIT</text><text x="14" y="63" font-size="12" font-family="Special Elite" fill="#6d5a40">ONE</text><text x="76" y="55" font-size="9" font-family="Special Elite" fill="#6d5a40">Nº7</text>`},
 {id:'tag',n:'Etiqueta',c:'vintage etiquetas',col:'#d9c09a',s:c=>`<path ${W} fill="${c}" d="M30 20h56v60H30L10 50z"/><circle cx="26" cy="50" r="5" fill="#fbf4e8"/><path d="M26 50C14 40 6 30 4 16" stroke="#8b6f52" stroke-width="2" fill="none"/>`},
 {id:'pin',n:'Chincheta',c:'minimal',col:'#d0636e',s:c=>`<ellipse cx="54" cy="84" rx="14" ry="4" fill="rgba(0,0,0,.15)"/><path d="M50 48l-6 36" stroke="#9a9a9a" stroke-width="3"/><circle ${W} cx="50" cy="36" r="24" fill="${c}"/><circle cx="42" cy="28" r="7" fill="#fff" opacity=".45"/>`},
 {id:'rainbow',n:'Arcoíris',c:'kawaii',col:'#e8a1a1',s:c=>`<g fill="none" stroke-width="9" stroke-linecap="round"><path d="M14 74a36 36 0 0 1 72 0" stroke="${c}"/><path d="M24 74a26 26 0 0 1 52 0" stroke="#efcf8a"/><path d="M34 74a16 16 0 0 1 32 0" stroke="#a9c3a0"/></g>`},
 {id:'bow',n:'Moño',c:'romántico',col:'#e3a2ad',s:c=>`<g ${W} fill="${c}"><path d="M50 46C34 26 10 26 12 42s22 18 38 4zM50 46c16-20 40-20 38-4S66 60 50 46z"/><path d="M46 50l-14 36 10-4 6 8 2-40zM54 50l14 36-10-4-6 8-2-40z"/><circle cx="50" cy="47" r="8"/></g>`},
];
const TAPES=[{id:'plain',n:'Lisa'},{id:'stripes',n:'Rayas'},{id:'dots',n:'Puntos'},{id:'grid',n:'Cuadros'},{id:'diag',n:'Diagonal'},{id:'hearts',n:'Corazoncitos'}];
const TAPE_COLORS=['#EDB8B7','#F6E08A','#386660','#e9c2c4','#c9d6bd','#d6cde6','#f0dcae','#bcd1de','#dcc4ad','#f2f2f2'];
const PAPERS=[{id:'torn',n:'Papel rasgado'},{id:'lined',n:'Hoja rayada'},{id:'gridp',n:'Recorte cuadriculado'},{id:'kraft',n:'Kraft'},{id:'note',n:'Nota adhesiva'},{id:'polaroid',n:'Marco polaroid'}];
const NOTE_COLORS=['#F6E08A','#EDB8B7','#f6e3a1','#f3c8cc','#cfe0c4','#d9d0ec','#cfe2ec'];
const FONTS=[['Bodoni','"Bodoni Moda", serif'],['Pincel','"Caveat Brush", cursive'],['Caveat','Caveat, cursive'],['Amatic','"Amatic SC", cursive'],['Manuscrita','"Homemade Apple", cursive'],['Máquina','"Special Elite", monospace'],['Clásica','"Cormorant Garamond", serif'],['Elegante','"Playfair Display", serif'],['Serif','"Young Serif", serif'],['Sans','Figtree, sans-serif']];
const BGS=[['plain','Liso'],['lines','Líneas'],['grid','Cuadrícula'],['dots','Puntos'],['vintage','Vintage'],['kraft','Kraft']];
const BG_COLORS=['#fbf7f0','#fffdf8','#f4ebe0','#f6e8e8','#eef1e8','#efecf5','#f3efe2'];

const LEATHERS=[...DL_LEATHERS.map(([,n,c])=>[n[0].toUpperCase()+n.slice(1),c]),['Coñac','#8a5233'],['Arena','#c9a57d'],['Salvia','#7f9177'],['Lavanda','#8d81a6'],['Burdeos','#6e2b33'],['Verde Delulu','#386660'],['Negro','#262020']];
const ELASTICS=[...DL_ELASTICS.map(([,n,c])=>[n[0].toUpperCase()+n.slice(1),c]),['Lavanda','#a596c4'],['Oro','#c9a24a']];
const CHARM_SHAPES=[['croissant','Croissant'],['heart','Corazón'],['star','Estrella'],['flower','Flor'],['moon','Luna'],['tree','Árbol'],['letter','Inicial'],['bead','Cuenta'],['key','Llave'],['leaf','Hoja'],['shell','Concha']];
const MATERIALS=[['oro','Oro'],['plata','Plata'],['bronce','Bronce'],['esmalte','Esmalte'],['perla','Perla']];
const SIZES={a5:[560,790],a6:[397,560],b6:[500,700],sq:[620,620],pocket:[440,680]};
const TEMPLATES=[['blank','En blanco'],['diario','Diario personal'],['gratitud','Gratitud'],['bullet','Bullet journal'],['semanal','Agenda semanal'],['mensual','Agenda mensual'],['viajes','Diario de viajes'],['recuerdos','Álbum de recuerdos'],['emocional','Diario emocional'],['estudio','Agenda de estudio'],['ideas','Libreta de ideas'],['scrapbook','Scrapbook libre']];

/* ================= textures ================= */
const TEX={};
function makeTex(kind){if(TEX[kind])return TEX[kind];const c=document.createElement('canvas');c.width=c.height=220;const x=c.getContext('2d');const im=x.createImageData(220,220);
  const amp=kind==='granulado'?70:kind==='natural'?45:22;
  for(let i=0;i<im.data.length;i+=4){const v=128+(Math.random()-.5)*amp;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}
  x.putImageData(im,0,0);
  if(kind==='granulado'){for(let i=0;i<900;i++){const px=Math.random()*220,py=Math.random()*220,r=1.5+Math.random()*3;const g=x.createRadialGradient(px-r*.3,py-r*.3,0,px,py,r);g.addColorStop(0,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(0,0,0,.22)');x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill()}}
  if(kind==='natural'){for(let i=0;i<26;i++){const px=Math.random()*220,py=Math.random()*220,r=20+Math.random()*50;const g=x.createRadialGradient(px,py,0,px,py,r);const d=Math.random()<.5;g.addColorStop(0,d?'rgba(0,0,0,.14)':'rgba(255,255,255,.10)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,220,220)}
    x.strokeStyle='rgba(0,0,0,.08)';for(let i=0;i<14;i++){x.beginPath();let px=Math.random()*220,py=Math.random()*220;x.moveTo(px,py);for(let j=0;j<4;j++){px+=(Math.random()-.5)*40;py+=(Math.random()-.5)*20;x.lineTo(px,py)}x.stroke()}}
  if(kind==='saffiano'){x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=1;for(let i=-220;i<440;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i+220,220);x.stroke();x.beginPath();x.moveTo(i+220,0);x.lineTo(i,220);x.stroke()}}
  TEX[kind]=c.toDataURL('image/jpeg',.82);document.documentElement.style.setProperty('--tx-'+kind,`url(${TEX[kind]})`);return TEX[kind]}
const texVar=k=>(makeTex(k),`var(--tx-${k})`);
const PATTERNS={
  none:()=>'none',
  rombos:c=>`repeating-linear-gradient(45deg,transparent 0 22px,rgba(255,255,255,.08) 22px 23px),repeating-linear-gradient(-45deg,transparent 0 22px,rgba(255,255,255,.08) 22px 23px)`,
  puntos:()=>`radial-gradient(rgba(255,255,255,.13) 1.5px,transparent 2px) 0 0/16px 16px`,
  rayas:()=>`repeating-linear-gradient(90deg,transparent 0 18px,rgba(0,0,0,.08) 18px 22px)`,
  floral:()=>`radial-gradient(circle at 50% 50%,rgba(255,255,255,.12) 0 3px,transparent 4px) 0 0/40px 40px,radial-gradient(circle at 50% 50%,rgba(255,255,255,.08) 0 8px,transparent 9px) 20px 20px/40px 40px`,
  cuadros:()=>`linear-gradient(rgba(0,0,0,.09) 2px,transparent 2px) 0 0/34px 34px,linear-gradient(90deg,rgba(0,0,0,.09) 2px,transparent 2px) 0 0/34px 34px`
};
const PATTERN_NAMES=[['none','Ninguno'],['rombos','Rombos'],['puntos','Puntos'],['rayas','Rayas'],['floral','Floral'],['cuadros','Cuadros']];

/* ================= charm rendering ================= */
function matFill(mat,col,id){
  const g={oro:['#fbeaa0','#d9b04a','#9c7424'],plata:['#ffffff','#c9ccd1','#7f858c'],bronce:['#f0c08a','#b47a43','#6e431f'],perla:['#ffffff','#f6e9ea','#d8c7c9'],esmalte:[shade(col,.35),col,shade(col,-.3)]}[mat]||['#fff','#ccc','#888'];
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset=".5" stop-color="${g[1]}"/><stop offset="1" stop-color="${g[2]}"/></linearGradient>`}
function charmSVG(ch,w=40){if(typeof CHARM_PHOTOS!=='undefined'&&CHARM_PHOTOS[ch.shape])return charmPhotoSVG(ch,w);
  const id='g'+uid(), f=`url(#${id})`, edge=ch.material==='esmalte'?shade(ch.color,-.4):'rgba(60,40,20,.5)';
  const metal=ch.material==='esmalte'?'#d9b04a':ch.material==='perla'?'#d9c8a0':null;
  let shape='';const S=`fill="${f}" stroke="${edge}" stroke-width="1"`;
  switch(ch.shape){
    case 'heart':shape=`<path ${S} d="M20 50C6 41 4 31 11 27c5-3 8 0 9 3 1-3 4-6 9-3 7 4 5 14-9 23z"/>`;break;
    case 'star':shape=`<path ${S} d="M20 22l4.5 9.5 10.5 1.2-7.8 7 2.2 10.4L20 45l-9.4 5.1 2.2-10.4-7.8-7 10.5-1.2z"/>`;break;
    case 'flower':shape=[0,72,144,216,288].map(a=>`<ellipse ${S} cx="20" cy="29" rx="5" ry="8" transform="rotate(${a} 20 37)"/>`).join('')+`<circle cx="20" cy="37" r="4" fill="${metal||'#f6e4a0'}"/>`;break;
    case 'moon':shape=`<path ${S} d="M24 22a14 14 0 1 0 10 22 12 12 0 0 1-10-22z"/>`;break;
    case 'tree':shape=`<g ${S}><circle cx="20" cy="31" r="8"/><circle cx="12" cy="36" r="6"/><circle cx="28" cy="36" r="6"/><rect x="18" y="38" width="4" height="12"/></g>`;break;
    case 'letter':shape=`<circle ${S} cx="20" cy="37" r="13"/><circle cx="20" cy="37" r="10" fill="none" stroke="${edge}" stroke-width=".6"/><text x="20" y="42.5" text-anchor="middle" font-family="Young Serif, serif" font-size="15" fill="${ch.material==='esmalte'?'#fff':shade('#7a5a2a',-.2)}">${esc((ch.letter||'S').slice(0,1).toUpperCase())}</text>`;break;
    case 'bead':shape=`<circle ${S} cx="20" cy="30" r="6"/><circle ${S} cx="20" cy="44" r="8"/>`;break;
    case 'key':shape=`<g ${S}><circle cx="20" cy="27" r="6"/><rect x="18.5" y="32" width="3" height="20"/><rect x="21" y="45" width="5" height="3"/><rect x="21" y="40" width="4" height="3"/></g><circle cx="20" cy="27" r="2.5" fill="#000" opacity=".35"/>`;break;
    case 'leaf':shape=`<path ${S} d="M20 22c10 8 10 22 0 30-10-8-10-22 0-30z"/><path d="M20 24v26" stroke="${edge}" stroke-width=".8"/>`;break;
    case 'custom':shape=`<image href="${imgURL(ch.img)}" x="4" y="20" width="32" height="34" preserveAspectRatio="xMidYMid meet"/>`;break;
    case 'croissant':shape=`<defs><linearGradient id="${id}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7cf77"/><stop offset=".6" stop-color="#dc9a45"/><stop offset="1" stop-color="#b26f2c"/></linearGradient></defs><g fill="url(#${id}c)" stroke="#9a5a24" stroke-width=".8"><ellipse cx="7" cy="40" rx="3.6" ry="3" transform="rotate(-40 7 40)"/><ellipse cx="33" cy="40" rx="3.6" ry="3" transform="rotate(40 33 40)"/><ellipse cx="12.5" cy="36" rx="5" ry="5.6" transform="rotate(-28 12.5 36)"/><ellipse cx="27.5" cy="36" rx="5" ry="5.6" transform="rotate(28 27.5 36)"/><ellipse cx="20" cy="34" rx="6" ry="7"/></g><path d="M17 30q3 -2 6 0M15 36q5 -2 10 0" stroke="#fbe2a6" stroke-width="1" fill="none" opacity=".8"/>`;break;
    case 'shell':shape=`<path ${S} d="M20 22l14 18c-4 8-24 8-28 0z"/><path d="M20 22l-6 21M20 22v22M20 22l6 21" stroke="${edge}" stroke-width=".8"/>`;break;
  }
  const ringC=metal||'url(#'+id+')';
  return `<svg viewBox="0 0 40 60" width="${w}" height="${w*1.5}" style="overflow:visible"><defs>${matFill(ch.material,ch.color,id)}</defs>
  <g filter="drop-shadow(1px 2px 1.5px rgba(0,0,0,.45))"><circle cx="20" cy="6" r="4" fill="none" stroke="${ringC}" stroke-width="2"/><path d="M20 10v12" stroke="${ringC}" stroke-width="1.6" stroke-dasharray="2 1.2"/>${shape}</g>
  ${ch.material!=='esmalte'?'':`<ellipse cx="15" cy="32" rx="3" ry="2" fill="#fff" opacity=".5"/>`}</svg>`}

/* ================= element rendering ================= */
function tapeBg(p,c){const w='rgba(255,255,255,.55)';return{
  plain:c,stripes:`repeating-linear-gradient(90deg,${c} 0 8px,${w} 8px 12px)`,dots:`radial-gradient(${w} 2px,transparent 2.5px) 0 0/10px 10px,${c}`,
  grid:`linear-gradient(${w} 1px,transparent 1px) 0 0/8px 8px,linear-gradient(90deg,${w} 1px,transparent 1px) 0 0/8px 8px,${c}`,
  diag:`repeating-linear-gradient(45deg,${c} 0 6px,${w} 6px 9px)`,
  hearts:`radial-gradient(circle at 30% 40%,${w} 2px,transparent 2.5px) 0 0/14px 12px,radial-gradient(circle at 70% 40%,${w} 2px,transparent 2.5px) 0 0/14px 12px,${c}`}[p]||c}
const ZZ='polygon(0 0,3% 12%,0 25%,3% 37%,0 50%,3% 62%,0 75%,3% 87%,0 100%,100% 100%,97% 87%,100% 75%,97% 62%,100% 50%,97% 37%,100% 25%,97% 12%,100% 0)';
const TORN='polygon(0 4%,8% 0,17% 3%,26% 1%,35% 4%,46% 0,57% 3%,66% 1%,77% 4%,88% 1%,100% 3%,99% 30%,100% 60%,98% 100%,88% 97%,76% 100%,64% 96%,52% 99%,40% 96%,28% 100%,16% 97%,4% 100%,0 70%,1% 35%)';
function textHTML(t,interactive){const lines=String(t||'').split('\n');return lines.map((ln,i)=>{const m=ln.match(/^\s*\[( |x)\]\s?(.*)$/i);
  if(m){const on=m[1].toLowerCase()==='x';return `<div><span class="chk${on?' on':''}" data-line="${i}"></span><span class="${on?'done':''}">${esc(m[2])}</span></div>`}
  return `<div>${esc(ln)||'&nbsp;'}</div>`}).join('')}
function textStyle(e){const fs=e.fs||24;return `font-family:${(e.font||'Caveat, cursive').replace(/"/g,"'")};font-size:${fs}px;color:${e.color||'#3b2d26'};font-weight:${e.b?700:400};font-style:${e.it?'italic':'normal'};text-decoration:${e.u?'underline':'none'};text-align:${e.al||'left'};`}
function textEffect(e){if(e.fx==='grabado')return `color:${shade(e.lea||'#6b4430',-.5)};text-shadow:0 1px 0 rgba(255,255,255,.26),0 -1px 1px rgba(0,0,0,.5);`;
  if(e.fx==='dorado')return `color:transparent;background:linear-gradient(170deg,#fff3b8,#d4a843 45%,#8f6a1f 55%,#f1d27a);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 1px 0 rgba(0,0,0,.35));`;
  if(e.fx==='plata')return `color:transparent;background:linear-gradient(170deg,#fff,#c3c7cc 45%,#7d838a 55%,#eef0f2);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 1px 0 rgba(0,0,0,.35));`;
  return ''}
function elInner(e){
  switch(e.type){
    case 'text':{const bg=e.bg==='papel'?`background:#fffdf7;clip-path:${TORN};padding:14px 16px;`:e.bg==='cinta'?`background:${e.bgc||'#f3dfe1'};padding:8px 12px;`:'';
      return `<div class="ct" style="${textStyle(e)}${bg}${textEffect(e)}padding-top:${bg?'':'2px'}">${textHTML(e.text)}</div>`}
    case 'note':return `<div class="ct" style="background:${e.bgc||'#f6e3a1'};box-shadow:0 6px 10px -6px rgba(0,0,0,.4);padding:16px 14px;${textStyle({...e,fs:e.fs||22})};white-space:pre-wrap;overflow:hidden"><div style="position:absolute;left:0;right:0;top:0;height:16px;background:rgba(0,0,0,.05)"></div>${textHTML(e.text)}</div>`;
    case 'image':{const src=imgURL(e.img);const mk=maskOf(e);const fr=mk?'none':(e.frame||'none');
      const pad=fr==='polaroid'?'8% 6% 22% 6%':fr==='borde'?'5%':'0';
      const bg=fr==='polaroid'||fr==='borde'?'#fff':'transparent';
      const sh=e.shadow!==false?' drop-shadow(0 6px 8px rgba(0,0,0,.28))':'';
      const ol=mk&&e.outline?'drop-shadow(2.5px 0 0 #fff) drop-shadow(-2.5px 0 0 #fff) drop-shadow(0 2.5px 0 #fff) drop-shadow(0 -2.5px 0 #fff)':'';
      const filt=ol||sh?`filter:${ol}${sh};`:'';
      const cid=mk==='lasso'?`lp-${e.id}-${++LPC}`:'cp-'+mk;
      const clip=mk?`clip-path:url(#${cid});-webkit-clip-path:url(#${cid})`:`border-radius:${fr==='redondo'?'14px':'0'}`;
      const defs=mk==='lasso'&&e.lasso?`<svg width="0" height="0" style="position:absolute"><clipPath id="${cid}" clipPathUnits="objectBoundingBox"><path d="${esc(e.lasso)}"/></clipPath></svg>`:'';
      const z=e.zoom||1;
      return `<div class="ct" style="background:${bg};padding:${pad};border-radius:${fr==='redondo'?'16px':'2px'};${filt}">${defs}<div style="width:100%;height:100%;overflow:hidden;${clip}"><img src="${src}" alt="" draggable="false" style="transform:scale(${z});object-position:${e.px??50}% ${e.py??50}%"></div>${fr==='polaroid'&&e.cap?`<div style="position:absolute;left:0;right:0;bottom:4%;text-align:center;font-family:Caveat,cursive;font-size:${Math.max(14,e.h*.07)}px;color:#4a3a33">${esc(e.cap)}</div>`:''}</div>`}
    case 'sticker':{if(e.custom){const src=imgURL(e.custom);return `<div class="ct"><img src="${src}" alt="" draggable="false" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 3px 3px rgba(0,0,0,.25))"></div>`}
      const st=STICKERS.find(s=>s.id===e.sid)||STICKERS[0];return `<div class="ct"><svg viewBox="${st.vb||'0 0 100 100'}" width="100%" height="100%" style="overflow:visible;filter:drop-shadow(0 3px 3px rgba(0,0,0,.22))">${st.s(e.color||st.col)}</svg></div>`}
    case 'tape':return `<div class="ct" style="background:${tapeBg(e.pat,e.color||'#e9c2c4')};opacity:.88;clip-path:${ZZ};box-shadow:0 1px 2px rgba(0,0,0,.1)"></div>`;
    case 'paper':{const c=e.color;switch(e.pid){
      case 'torn':return `<div class="ct" style="background:${c||'#fffdf6'};clip-path:${TORN};filter:drop-shadow(0 2px 2px rgba(0,0,0,.2))"></div>`;
      case 'lined':return `<div class="ct" style="background:repeating-linear-gradient(${c||'#fffefa'} 0 21px,#b9cde0 21px 22px);border-left:2px solid #e6a3a8;box-shadow:0 3px 6px rgba(0,0,0,.18)"></div>`;
      case 'gridp':return `<div class="ct" style="background:linear-gradient(#c9d8e8 1px,transparent 1px) 0 0/14px 14px,linear-gradient(90deg,#c9d8e8 1px,transparent 1px) 0 0/14px 14px,${c||'#fbfbf8'};clip-path:${TORN}"></div>`;
      case 'kraft':return `<div class="ct" style="background:${c||'#c8a57c'};background-image:${texVar('liso')};background-blend-mode:soft-light;box-shadow:0 3px 6px rgba(0,0,0,.2)"></div>`;
      case 'polaroid':return `<div class="ct" style="background:#fff;box-shadow:0 6px 10px -4px rgba(0,0,0,.3)"><div style="position:absolute;left:7%;right:7%;top:7%;bottom:24%;background:${c||'#e9e2d7'}"></div></div>`;
      default:return `<div class="ct" style="background:${c||'#f6e3a1'}"></div>`}}
    case 'stroke':return `<div class="ct"><svg viewBox="0 0 ${e.vw||e.w} ${e.vh||e.h}" width="100%" height="100%" preserveAspectRatio="none" style="overflow:visible"><path d="${e.d}" fill="none" stroke="${e.color}" stroke-width="${e.sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${e.tool==='marker'?.45:1}" ${e.tool==='brush'?'style="filter:url(#none)"':''}/></svg></div>`;
  }
  return ''}
function elStyle(e,z){return `left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px;transform:rotate(${e.r||0}deg);opacity:${e.op??1};z-index:${z}`}
function elHTML(e,z){const cls={text:'txt',note:'txt',image:'img'}[e.type]||'';return `<div class="el ${cls}${e.locked?' locked':''}" data-id="${e.id}" style="${elStyle(e,z)}">${elInner(e)}</div>`}
function bgCSS(bg){const c=bg?.color||'#fbf7f0',l='rgba(120,150,180,.28)';switch(bg?.type){
  case 'lines':return `background:linear-gradient(transparent 31px,${l} 31px) 0 6px/100% 32px,${c}`;
  case 'grid':return `background:linear-gradient(${l} 1px,transparent 1px) 0 0/22px 22px,linear-gradient(90deg,${l} 1px,transparent 1px) 0 0/22px 22px,${c}`;
  case 'dots':return `background:radial-gradient(rgba(110,90,80,.35) 1.2px,transparent 1.6px) 0 0/22px 22px,${c}`;
  case 'vintage':return `background:radial-gradient(ellipse at center,transparent 50%,rgba(150,110,60,.18)),${texVar('natural')},${c};background-blend-mode:normal,soft-light,normal`;
  case 'kraft':return `background:${texVar('liso')},${bg.color&&bg.color!=='#fbf7f0'?bg.color:'#d2b48c'};background-blend-mode:soft-light`;
  default:return `background:${c}`}}

/* ---- shared helpers ---- */
const elsHTML=els=>els.map((e,i)=>elHTML(e,i+1)).join('');
/* One page renderer for the editor (live: elements painted later), page turns, thumbnails and the shared view. */
function pageHTML(p,pi,W,H,cls,live){if(!p)return `<div class="page ${cls} blankleaf" style="width:${W}px;height:${H}px"></div>`;
  return `<div class="page ${cls}"${live?` data-pi="${pi}"`:''} style="width:${W}px;height:${H}px;${bgCSS(p.bg)}"><div class="els" style="position:absolute;inset:0">${live?'':elsHTML(p.elements)}</div>${live&&!p.elements.length?'<span class="pagehint">Página en blanco · usa <b>Agregar</b> para pegar stickers, fotos o texto</span>':''}<span class="num">${pi+1}</span></div>`}
/* Runtime capabilities of the viewer (null when this view can't use them). */
async function cap(n){try{return window.claude?.use?await window.claude.use(n):null}catch(e){return null}}
