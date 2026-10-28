
/* ================= model helpers ================= */
function dims(a){const s=SIZES[a.size]||SIZES.a5;return a.orient==='land'?[s[1],s[0]]:[s[0],s[1]]}
/* New notebooks follow the real Delulu: smooth leather with a front flap, side rivets, a thin horizontal elastic and a charm in the middle. */
function coverDefaults(){return{model:'delulu',color:'#6E4127',texture:'liso',finish:'mate',pattern:'none',elements:[],
  elastic:{color:'#2457C9',width:6,orient:'horizontal',style:'cordon',pos:.45},charms:[{id:uid(),shape:'croissant',material:'oro',color:'#c4878c',size:1.15,letter:'D'}]}}
const initialsEl=(txt,W,H)=>({id:uid(),type:'text',text:txt.toUpperCase().slice(0,3),x:W*.6,y:H*.875,w:W*.2,h:40,r:0,font:'"Bodoni Moda", serif',fs:22,al:'center',fx:'dorado',color:'#fbf2ea',role:'initials'});

const T=(text,x,y,w,h,o={})=>({id:uid(),type:'text',text,x,y,w,h,r:0,font:'Caveat, cursive',fs:26,color:'#3b2d26',...o});
const ST=(sid,x,y,s,o={})=>({id:uid(),type:'sticker',sid,x,y,w:s,h:s,r:o.r||0,...o});
const TP=(x,y,w,r,o={})=>({id:uid(),type:'tape',pat:'stripes',color:'#e9c2c4',x,y,w,h:30,r,...o});
const PP=(pid,x,y,w,h,o={})=>({id:uid(),type:'paper',pid,x,y,w,h,r:0,...o});
const NT=(text,x,y,s,o={})=>({id:uid(),type:'note',text,x,y,w:s,h:s,r:o.r||0,font:'Caveat, cursive',fs:22,...o});
const pg=(bg,els=[])=>({id:uid(),bg:{type:bg,color:'#fbf7f0'},elements:els});
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function templatePages(tpl,bgType,W,H){
  const t=(s,o)=>T(s,40,40,W-80,60,{font:'"Young Serif", serif',fs:34,...o});
  const now=new Date(), mes=MESES[now.getMonth()];
  switch(tpl){
    case 'diario':return[pg(bgType,[t('Querido diario'),T('Fecha: ___________',40,104,W-80,36,{fs:22,color:'#8a7366'}),ST('flower',W-120,30,80,{r:12})]),pg(bgType),pg(bgType),pg(bgType)];
    case 'gratitud':return[pg(bgType,[t('Hoy agradezco…'),T('1.\n\n2.\n\n3.',50,120,W-100,260,{fs:28}),ST('heart',W-110,H-140,70,{r:-10}),TP(W/2-80,22,160,-3,{color:'#c9d6bd',pat:'dots'})]),pg(bgType),pg(bgType)];
    case 'bullet':return[pg('dots',[t('Registro diario',{font:'"Special Elite", monospace',fs:28}),T(`[ ] Tarea pendiente\n[x] Tarea hecha\n— Nota rápida\n○ Evento`,46,110,W-92,180,{fs:24}),T('Clave: [ ] tarea · ○ evento · — nota',46,H-90,W-92,30,{fs:16,font:'Figtree, sans-serif',color:'#8a7366'})]),pg('dots'),pg('dots')];
    case 'semanal':{const d=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],bh=(H-130)/4;
      const L=[t('Semana',{fs:30}),...d.slice(0,4).map((x,i)=>T(x+'\n',40,100+i*bh,W-80,bh-10,{fs:22,bg:'cinta',bgc:['#f3dfe1','#e3ead9','#e6e0f0','#f3e7c9'][i]}))];
      const R=[...d.slice(4).map((x,i)=>T(x+'\n',40,40+i*bh,W-80,bh-10,{fs:22,bg:'cinta',bgc:['#f3dfe1','#e3ead9','#e6e0f0'][i]})),NT('Notas de la semana',40,H-bh-20,Math.min(bh,200),{r:-3})];
      return[pg(bgType,L),pg(bgType,R)]}
    case 'mensual':{const first=new Date(now.getFullYear(),now.getMonth(),1).getDay(),days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
      let g='L  M  M  J  V  S  D\n',o=(first+6)%7;let row='   '.repeat(o);for(let d=1;d<=days;d++){row+=String(d).padStart(2,' ')+' ';if((d+o)%7===0){g+=row.trimEnd()+'\n';row=''}}g+=row;
      return[pg(bgType,[t(mes[0].toUpperCase()+mes.slice(1)+' '+now.getFullYear()),T(g,40,120,W-80,300,{font:'"Special Elite", monospace',fs:22}),T('Metas del mes\n[ ] \n[ ] \n[ ] ',40,H-220,W-80,180,{fs:24})]),pg(bgType)]}
    case 'viajes':return[pg(bgType,[t('Destino:',{font:'"Amatic SC", cursive',fs:44}),ST('ticket',W-190,40,140,{r:8}),PP('polaroid',50,150,W*.5,W*.6,{r:-4}),TP(80,140,120,-8,{color:'#bcd1de',pat:'grid'}),T('Lo mejor del día…',W*.55,H*.55,W*.38,140,{fs:22}),ST('postmark',W*.55,H-170,130,{color:'#6f5a7e'})]),pg(bgType)];
    case 'recuerdos':return[pg(bgType,[t('Recuerdos',{font:'"Playfair Display", serif',it:true}),PP('polaroid',40,120,W*.45,W*.55,{r:-5}),PP('polaroid',W*.48,180,W*.45,W*.55,{r:4}),TP(70,110,110,-12,{color:'#f0dcae'}),TP(W*.6,170,110,10,{color:'#d6cde6',pat:'dots'})]),pg(bgType)];
    case 'emocional':return[pg(bgType,[t('¿Cómo me siento hoy?'),ST('happy',50,120,80),ST('love',150,120,80),ST('sleepy',250,120,80),T('Lo que pasó:\n\n\nLo que necesito:',40,230,W-80,280,{fs:24})]),pg(bgType)];
    case 'estudio':return[pg('grid',[t('Plan de estudio',{font:'Figtree, sans-serif',b:true,fs:30}),T('Materia:\nTemas:\n[ ] \n[ ] \n[ ] \nExamen: ',40,110,W-80,240,{fs:24}),NT('Repasar fórmulas',W-200,H-210,160,{r:4,bgc:'#cfe2ec'})]),pg('grid'),pg('lines')];
    case 'ideas':return[pg('dots',[t('Ideas sueltas',{font:'"Amatic SC", cursive',fs:48}),NT('Idea 1',40,130,170,{r:-4}),NT('Idea 2',W-220,170,170,{r:3,bgc:'#f3c8cc'}),ST('sparkle',W/2-30,H/2,60)]),pg('dots'),pg('dots')];
    case 'scrapbook':return[pg('kraft',[PP('torn',40,60,W-80,H*.4,{r:-2}),T('Scrapbook',60,80,W-120,70,{font:'"Amatic SC", cursive',fs:56}),ST('butterfly',W-150,H*.45,100,{r:14}),TP(30,40,140,-20,{color:'#f0dcae',pat:'diag'})]),pg('kraft')];
    default:return[pg(bgType),pg(bgType)];
  }}
function newAgenda(o){const a={id:uid(),name:o.name||'Mi agenda',type:o.type||'blank',size:o.size||'a5',orient:o.orient||'port',created:Date.now(),updated:Date.now(),cover:coverDefaults(),pageBg:o.pageBg||'lines'};
  Object.assign(a.cover,{color:o.color||a.cover.color,texture:o.texture||a.cover.texture});a.cover.elastic.color=o.elastic||a.cover.elastic.color;
  if(o.charm)a.cover.charms=o.charm==='none'?[]:[{id:uid(),shape:o.charm,material:'oro',color:'#c4878c',size:typeof CHARM_PHOTOS!=='undefined'&&CHARM_PHOTOS[o.charm]?1.75:o.charm==='croissant'?1.15:1,letter:(o.initials||o.name||'D')[0].toUpperCase()}];
  const [W,H]=dims(a);a.pages=a.type.startsWith('pack:')?[...PACKS.find(p=>'pack:'+p.id===a.type).pages.map((_,i)=>packPage(a.type.slice(5),i,W,H)),pg(a.pageBg),pg(a.pageBg)]:templatePages(a.type,a.pageBg,W,H);
  a.cover.elements=o.noTitle?[]:[{id:uid(),type:'text',text:a.name,x:W*.08,y:H*.24,w:W*.7,h:90,r:0,font:'"Bodoni Moda", serif',it:true,fs:Math.min(46,Math.max(26,560/Math.max(8,a.name.length))),al:'center',fx:'grabado',color:'#3b2d26'}];
  if(o.initials)a.cover.elements.push(initialsEl(o.initials,W,H));
  return a}
function seed(){const a=newAgenda({name:'Diario de otoño',type:'diario',color:'#6E4127',elastic:'#2457C9',charm:'croissant',initials:'S'});
  const[W,H]=dims(a);a.pages[0].elements=[T('Domingo de lluvia',40,40,W-80,60,{font:'"Young Serif", serif',fs:32}),
    PP('polaroid',46,130,250,290,{r:-5,color:'#d9c9b4'}),TP(110,118,120,-10,{color:'#e9c2c4',pat:'stripes'}),
    T('Café, un libro del club\ny el gato dormido en\nmis piernas.',W-250,150,220,130,{fs:24,r:3}),ST('cup',W-150,300,90,{r:-8}),
    NT('[x] Terminar capítulo 4\n[ ] Llamar a mamá\n[ ] Regar plantas',40,H-260,220,{r:-2}),ST('leaf',W-150,H-170,90,{r:20,color:'#a3b48f'}),ST('sparkle',W-210,H-210,40,{color:'#e3b75c'})];
  a.pages[1].elements=[T('Lecturas pendientes',40,40,W-80,50,{fs:30}),PP('lined',50,110,W-100,240,{r:1}),T('[ ] Cien años de soledad\n[ ] La campana de cristal\n[x] Rayuela',70,124,W-140,200,{fs:24}),ST('flower',W-120,H-170,80,{r:10}),TP(W-200,96,120,8,{color:'#d6cde6',pat:'dots'})];
  a.updated=Date.now()-3600e3*20;
  const b=newAgenda({name:'Ideas delulu',type:'ideas',size:'a6',color:'#E7A8B1',elastic:'#386660',charm:'star'});b.cover.charms.push({id:uid(),shape:'bead',material:'perla',color:'#fff',size:.8,letter:'I'});
  b.cover.elements[0].fx='dorado';b.cover.elements.push({id:uid(),type:'sticker',sid:'sparkle',x:dims(b)[0]/2-26,y:dims(b)[1]*.3+110,w:52,h:52,r:0,color:'#e9d39a'});
  b.updated=Date.now()-86400e3*3;
  const c=newAgenda({name:'Viajes 2026',type:'viajes',color:'#2F4A73',elastic:'#F2D36B',charm:'letter',initials:'V'});c.cover.elements[0].fx='dorado';c.cover.elements[0].color='#fbf2ea';
  c.cover.charms=[{id:uid(),shape:'letter',material:'plata',color:'#c4878c',size:1.2,letter:'V'}];c.cover.elastic.orient='horizontal';c.cover.elastic.pos=.62;c.cover.elastic.style='plano';c.cover.elements[0].fx='impreso';c.cover.elements[0].color='#fbf2ea';c.cover.elements[0].font='"Amatic SC", cursive';c.cover.elements[0].fs=60;
  c.updated=Date.now()-86400e3*9;
  return{v:1,agendas:[a,b,c],images:{},prefs:{pal:'calido',favs:[],custom:[]}}}

/* ================= closed book ================= */
function bandHTML(a,W,H){const e=a.cover.elastic,t=e.width||9,c=e.color;
  const bg=bandFill(e,false),bgH=bandFill(e,true);
  const sh='box-shadow:0 3px 4px rgba(0,0,0,.35)';const stitch=e.style==='plano'?`<div style="position:absolute;inset:0;margin:auto;${e.orient==='horizontal'?'height:0;border-top':'width:0;border-left'}:1px dashed rgba(255,255,255,.4)"></div>`:'';
  if(e.orient==='horizontal'){const y=H*(e.pos??.6);return `<div class="band" style="left:-8px;right:-14px;top:${y-t/2}px;height:${t}px;background:${bgH};border-radius:${t}px;${sh}">${stitch}</div>`}
  const x=W*(e.pos??.84);return `<div class="band" style="top:-8px;bottom:-12px;left:${x-t/2}px;width:${t}px;background:${bg};border-radius:${t}px;${sh}">${stitch}</div>`}
function charmsHTML(a,W,H){const e=a.cover.elastic,ch=a.cover.charms||[];if(!ch.length)return'';const offs=[0,-22,22,-42,42,-62];
  return ch.map((c,i)=>{const s=46*(c.size||1);const v=e.orient!=='horizontal';
    const cx=v?W*(e.pos??.84)+offs[i%6]*.6:W*.5+offs[i%6];const cy=v?H*.42+i*8:H*(e.pos??.6)-4;
    return `<div class="charms" style="left:${cx-s/2}px;top:${cy-s*.12}px;transform:rotate(${(i%2?4:-5)}deg);transform-origin:50% 0">${charmSVG(c,s)}</div>`}).join('')}
const isTornasol=c=>(c.color||'').toLowerCase()===TORNASOL||c.finish==='tornasol';
function coverFace(a,W,H,withEls=true){const c=a.cover;
  const ph=c.photo&&imgURL(c.photo);
  return `<div class="cover" style="background:${c.color}">${ph?`<div class="cphoto" style="background:url(${ph}) center/cover;opacity:${c.photoOp??.85};mix-blend-mode:${c.photoBlend||'multiply'}"></div>`:''}
   <div class="tex" style="background:${texVar(c.texture||'liso')};mix-blend-mode:overlay;opacity:${c.texture==='liso'?.5:.85}"></div>
   <div class="pat" style="background:${(PATTERNS[c.pattern]||PATTERNS.none)()}"></div>
   ${c.model==='delulu'?'<div class="flapback"></div><div class="flap"></div><i class="rivet t"></i><i class="rivet b"></i>':'<div class="spine"></div><div class="stitch"></div>'}
   <div class="elayer">${withEls?(c.elements||[]).map((e,i)=>elHTML({...e,lea:c.color},i+1)).join(''):''}</div>
   ${isTornasol(c)?'<div class="iris"></div>':''}<div class="shine" style="background:${c.finish==='brillo'||isTornasol(c)?'linear-gradient(115deg,rgba(255,255,255,.28),rgba(255,255,255,0) 35%,rgba(255,255,255,0) 60%,rgba(255,255,255,.12) 75%,rgba(255,255,255,0) 90%)':'linear-gradient(115deg,rgba(255,255,255,.08),transparent 40%)'}"></div></div>`}
function bookHTML(a,width){const[W,H]=dims(a),s=width/W;
  return `<div style="width:${width}px;height:${H*s}px;position:relative"><div style="position:absolute;left:0;top:0;transform:scale(${s});transform-origin:0 0">
   <div class="book" style="width:${W}px;height:${H}px"><div class="edges"></div><div class="edges b"></div>${coverFace(a,W,H)}${bandHTML(a,W,H)}${charmsHTML(a,W,H)}</div></div></div>`}



/* ================= modals ================= */
function modal(html,cls=''){const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="dialog ${cls}" role="dialog" aria-modal="true">${html}</div>`;$('#modals').appendChild(m);
  m.addEventListener('pointerdown',e=>{if(e.target===m)m.remove()});return m}
function confirmBox(title,text,ok,fn){const m=modal(`<header><h2>${esc(title)}</h2></header><div class="content one"><p style="margin:0;color:var(--muted)">${esc(text)}</p></div><footer><button class="btn" data-x>Cancelar</button><button class="btn primary" data-ok>${esc(ok)}</button></footer>`,'sm');
  m.querySelector('[data-x]').onclick=()=>m.remove();m.querySelector('[data-ok]').onclick=()=>{m.remove();fn()}}
function chipRow(name,opts,val){return `<div class="opts" data-f="${name}">${opts.map(([v,l])=>`<button type="button" class="chip${v===val?' on':''}" data-v="${v}">${l}</button>`).join('')}</div>`}
const swBg=c=>c.toLowerCase()===TORNASOL?'conic-gradient(from 200deg,#ffd6ec,#d6ecff,#dcffe6,#fff4c6,#ffd6ec)':c;
function swRow(name,opts,val){return `<div class="swrow" data-f="${name}">${opts.map(([l,c])=>`<button type="button" class="sw${c===val?' on':''}" data-v="${c}" style="background:${swBg(c)}" title="${l}" aria-label="${l}"></button>`).join('')}</div>`}
function openCreate(edit){const o=edit?{name:edit.name,type:edit.type,size:edit.size,orient:edit.orient,color:edit.cover.color,texture:edit.cover.texture,pageBg:edit.pageBg,elastic:edit.cover.elastic.color}
   :{name:'',type:'diario',size:'a5',orient:'port',color:'#6E4127',texture:'liso',pageBg:'lines',elastic:'#2457C9',charm:'croissant',initials:''};
  const m=modal(`<header><h2>${edit?'Detalles de la agenda':'Nueva agenda'}</h2><div class="spacer"></div><button class="btn ghost icon" data-x aria-label="Cerrar">${ico('x')}</button></header>
  <div class="content"><div style="display:flex;flex-direction:column;gap:16px;min-width:0">
   <div class="field"><label class="lbl" for="fName">Nombre</label><input id="fName" type="text" maxlength="40" placeholder="Ej. Diario de otoño" value="${esc(o.name)}"></div>
   ${edit?'':`<div class="field"><span class="lbl">Empieza con</span><span class="hint">Solo es un punto de partida: después puedes cambiar todo.</span>${chipRow('type',TEMPLATES,o.type)}<span class="hint" style="margin-top:4px">O con un paquete temático ya decorado:</span>${chipRow('type',PACKS.map(p=>['pack:'+p.id,p.n]),o.type)}</div>`}
   <div class="field"><span class="lbl">Tamaño</span>${chipRow('size',[...DL_SIZES.map(([v,l,d])=>[v,`${l} · ${d}`]),...(SIZES[o.size]&&!DL_SIZES.some(x=>x[0]===o.size)?[[o.size,{b6:'B6',sq:'Cuadrada',pocket:'Bolsillo'}[o.size]||o.size]]:[])],o.size)}</div>
   <div class="field"><span class="lbl">Orientación</span>${chipRow('orient',[['port','Vertical'],['land','Horizontal']],o.orient)}</div>
   <div class="field"><span class="lbl">Color del cuero</span>${swRow('color',LEATHERS,o.color)}</div>
   <div class="field"><span class="lbl">Textura</span>${chipRow('texture',[['natural','Natural'],['liso','Liso'],['granulado','Granulado'],['saffiano','Saffiano']],o.texture)}</div>
   <div class="field"><span class="lbl">Elástico</span>${swRow('elastic',ELASTICS,o.elastic)}</div>
   ${edit?'':`<div class="field"><span class="lbl">Charm</span>${chipRow('charm',DL_CHARMS,o.charm)}</div>
   <div class="field"><label class="lbl" for="fIni">Iniciales grabadas <span style="text-transform:none;letter-spacing:0;font-weight:500">(opcional)</span></label><input id="fIni" type="text" maxlength="3" placeholder="Ej. SM" value="${esc(o.initials)}" style="max-width:120px;text-transform:uppercase"></div>`}
   ${edit?'':`<div class="field"><span class="lbl">Páginas interiores</span>${chipRow('pageBg',BGS,o.pageBg)}</div>`}
  </div><div class="preview-box" id="cPrev"></div></div>
  <footer><button class="btn" data-x>Cancelar</button><button class="btn primary" data-ok>${edit?'Guardar cambios':'Crear agenda'}</button></footer>`);
  const prev=()=>{const a=edit?clone(edit):newAgenda({...o,name:o.name||'Mi agenda'});if(edit){Object.assign(a,{name:o.name,size:o.size,orient:o.orient});a.cover.color=o.color;a.cover.texture=o.texture;a.cover.elastic.color=o.elastic;const t=a.cover.elements.find(x=>x.type==='text');if(t&&!edit)t.text=o.name}
    const[W]=dims(a);$('#cPrev',m).innerHTML=`<div class="cprev">${book3D(a,Math.round(W*.34),{ry:24,rx:6})}<span class="hint">${(DL_SIZES.find(x=>x[0]===a.size)||['','',''])[2]}</span></div>`};
  m.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){const f=b.parentElement.dataset.f;o[f]=b.dataset.v;$$(`[data-f="${f}"] [data-v]`,m).forEach(x=>x.classList.toggle('on',x===b));prev()}
    if(e.target.closest('[data-x]'))m.remove();
    if(e.target.closest('[data-ok]')){o.name=$('#fName',m).value.trim()||'Mi agenda';
      if(edit){const oldT=edit.cover.elements.find(x=>x.type==='text'&&x.text===edit.name);edit.name=o.name;if(oldT)oldT.text=o.name;edit.size=o.size;edit.orient=o.orient;edit.cover.color=o.color;edit.cover.texture=o.texture;edit.cover.elastic.color=o.elastic;edit.updated=Date.now();persist();m.remove();renderHome();toast('Cambios guardados')}
      else{const a=newAgenda(o);S.agendas.push(a);persist();m.remove();openCover(a,true)}}});
  $('#fName',m).addEventListener('input',e=>{o.name=e.target.value;if(!edit)prev()});$('#fIni',m)?.addEventListener('input',e=>{o.initials=e.target.value.trim();prev()});prev();setTimeout(()=>$('#fName',m).focus(),50)}
