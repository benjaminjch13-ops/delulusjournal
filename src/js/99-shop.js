
/* ================= tienda: solo "Pedí tu libreta" + redes ================= */
const closeDrawer=()=>{},coachClear=()=>{},closeBookMenu=()=>{},curScreen=()=>'order',go=()=>{};
S={agendas:[],images:{},prefs:{theme:'delulu',mode:'light',favs:[],custom:[]}};applyPrefs();
$('#brandHome').innerHTML=brandLogo('sm');$('.sf-logo').innerHTML=brandLogo('xl');$('#sfYear').textContent=new Date().getFullYear();
const shopStart=()=>{const h=location.hash;if(h==='#opiniones'){if(!$('#ordRoot').innerHTML)renderOrder();setTimeout(()=>$('#opiniones').scrollIntoView(),60);return}if(h==='#admin'){if(!$('#ordRoot').innerHTML)renderOrder();return}ORD.step=h==='#pedir'?1:0;renderOrder();$('#order').scrollTop=0};
document.addEventListener('click',e=>{const sc=e.target.closest('[data-scroll]');if(sc){e.preventDefault();$('#'+sc.dataset.scroll).scrollIntoView({behavior:'smooth'});return}const a=e.target.closest('[data-step]');if(a){e.preventDefault();ORD.step=+a.dataset.step;renderOrder();$('#order').scrollTo({top:0,behavior:'smooth'});history.replaceState(null,'','#pedir')}
  if(e.target.closest('#brandHome')){e.preventDefault();ORD.step=0;renderOrder();$('#order').scrollTo({top:0,behavior:'smooth'});history.replaceState(null,'',location.pathname)}});
addEventListener('hashchange',shopStart);shopStart();
