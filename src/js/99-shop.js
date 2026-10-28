
/* ================= tienda: solo "Pedí tu libreta" + redes ================= */
const closeDrawer=()=>{},coachClear=()=>{},closeBookMenu=()=>{},curScreen=()=>'order',go=()=>{};
S={agendas:[],images:{},prefs:{theme:'delulu',mode:'light',favs:[],custom:[]}};applyPrefs();
$('#brandHome').innerHTML=brandLogo('sm');$('.sf-logo').innerHTML=brandLogo('xl');$('#sfYear').textContent=new Date().getFullYear();
const shopStart=()=>{const st=location.hash==='#pedir'?1:0;ORD.step=st;renderOrder();$('#order').scrollTop=0};
document.addEventListener('click',e=>{const a=e.target.closest('[data-step]');if(a){e.preventDefault();ORD.step=+a.dataset.step;renderOrder();$('#order').scrollTo({top:0,behavior:'smooth'});history.replaceState(null,'','#pedir')}
  if(e.target.closest('#brandHome')){e.preventDefault();ORD.step=0;renderOrder();$('#order').scrollTo({top:0,behavior:'smooth'});history.replaceState(null,'',location.pathname)}});
addEventListener('hashchange',shopStart);shopStart();
