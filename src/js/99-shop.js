
/* ================= tienda: solo "Pedí tu libreta" + redes ================= */
const closeDrawer=()=>{},coachClear=()=>{},closeBookMenu=()=>{},curScreen=()=>'order',go=()=>{};
S={agendas:[],images:{},prefs:{theme:'delulu',mode:'light',favs:[],custom:[]}};applyPrefs();
$('#brandHome').innerHTML=brandLogo('sm');$('.sf-logo').innerHTML=brandLogo('xl');$('#sfYear').textContent=new Date().getFullYear();
const shopStart=()=>{const h=location.hash,n=h==='#pedir'?1:0;ORD.step=n;history.replaceState({ord:n},'',location.href);renderOrder();if(h==='#opiniones')setTimeout(()=>$('#opiniones').scrollIntoView(),80)};
document.addEventListener('click',e=>{const sc=e.target.closest('[data-scroll]');if(sc){e.preventDefault();$('#'+sc.dataset.scroll).scrollIntoView({behavior:'smooth'});return}const a=e.target.closest('[data-step]');if(a){e.preventDefault();goStep(+a.dataset.step)}
  if(e.target.closest('#brandHome')){e.preventDefault();goStep(0)}});
shopStart();
