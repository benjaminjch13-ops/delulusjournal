
/* ================= opiniones: las deja cualquiera, se guardan en /api/comments ================= */
const REV={rating:0,admin:(()=>{try{return sessionStorage.getItem('delulu-admin')||''}catch(_){return''}})(),data:null};
const starRow=(n,cls='')=>`<span class="stars ${cls}" aria-label="${n} de 5 estrellas">${[1,2,3,4,5].map(i=>`<i class="${i<=Math.round(n)?'on':''}">★</i>`).join('')}</span>`;
const revDate=t=>new Date(t).toLocaleDateString('es-GT',{day:'numeric',month:'short',year:'numeric'});
function renderRevs(){const d=REV.data,list=$('#revsList'),avg=$('#revsAvg');
  if(!d){list.innerHTML='<p class="revs-empty">Las opiniones se activan muy pronto ✦</p>';avg.innerHTML='';return}
  avg.innerHTML=d.count?`${starRow(d.avg,'big')}<b>${d.avg.toFixed(1)}</b><span>${d.count} ${d.count===1?'opinión':'opiniones'}</span>`:'';
  list.innerHTML=d.comments.length?d.comments.map(c=>`<article class="rev"><header>${starRow(c.rating)}<b>${esc(c.name)}</b><time>${revDate(c.date)}</time>${REV.admin?`<button type="button" class="rev-del" data-del="${esc(c.id)}" title="Borrar">${ico('trash')}</button>`:''}</header><p>${esc(c.text)}</p></article>`).join('')
    :'<p class="revs-empty">Todavía no hay opiniones. ¡Sé la primera en contarnos de tu Delulu! ✦</p>'}
async function loadRevs(){try{const r=await fetch('/api/comments',{cache:'no-store'});REV.data=r.ok?await r.json():null}catch(_){REV.data=null}renderRevs()}
function drawStars(){$('.revs-stars').innerHTML=[1,2,3,4,5].map(i=>`<button type="button" role="radio" aria-checked="${REV.rating===i}" aria-label="${i} ${i===1?'estrella':'estrellas'}" class="${i<=REV.rating?'on':''}" data-r="${i}">★</button>`).join('')}
drawStars();
$('.revs-stars').addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b){REV.rating=+b.dataset.r;drawStars()}});
$('#revsForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,msg=$('#revsMsg'),btn=$('button[type=submit]',f);
  const body={name:f.name.value.trim(),text:f.text.value.trim(),rating:REV.rating,website:f.website.value};
  if(!body.rating)return msg.textContent='Elegí cuántas estrellas le das ✦';if(body.name.length<2)return f.name.focus(),msg.textContent='Escribí tu nombre';if(body.text.length<5)return f.text.focus(),msg.textContent='Contanos un poquito más';
  btn.disabled=true;msg.textContent='Publicando…';
  try{const r=await fetch('/api/comments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(j.message||j.error||'No se pudo publicar');f.reset();REV.rating=0;drawStars();msg.textContent='¡Gracias! Tu opinión ya está publicada ✦';await loadRevs()}
  catch(err){msg.textContent=err.message==='storage'?'Las opiniones se activan muy pronto ✦':err.message}finally{btn.disabled=false}});
$('#revsList').addEventListener('click',async e=>{const b=e.target.closest('[data-del]');if(!b||!REV.admin)return;if(!confirm('¿Borrar esta opinión?'))return;
  const r=await fetch('/api/comments?id='+encodeURIComponent(b.dataset.del),{method:'DELETE',headers:{'x-admin-key':REV.admin}});
  if(r.ok){toast('Opinión borrada');loadRevs()}else{toast('Clave incorrecta');REV.admin='';try{sessionStorage.removeItem('delulu-admin')}catch(_){}renderRevs()}});
/* modo dueña: delulusjournal.vercel.app/#admin pide la clave y muestra el botón de borrar */
function adminLogin(){if(location.hash!=='#admin')return;const k=prompt('Clave de administración');history.replaceState(null,'',location.pathname);if(!k)return;REV.admin=k;try{sessionStorage.setItem('delulu-admin',k)}catch(_){}renderRevs();$('#opiniones').scrollIntoView({behavior:'smooth'});toast('Modo dueña: ya podés borrar opiniones')}
addEventListener('hashchange',adminLogin);adminLogin();loadRevs();
