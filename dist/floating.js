/* Long press moves a control; a short tap retains its existing action. */
function floatBounds(el){const app=document.querySelector('.app'),footer=document.getElementById('footer');return {width:app.clientWidth,height:app.clientHeight,minX:8,minY:8,maxX:Math.max(8,app.clientWidth-el.offsetWidth-8),maxY:Math.max(8,app.clientHeight-(footer.offsetHeight||0)-el.offsetHeight-8)};}
function putFloat(el,x,y){const b=floatBounds(el);x=Math.max(b.minX,Math.min(b.maxX,x));y=Math.max(b.minY,Math.min(b.maxY,y));if(el.dataset.float==='page'){x=b.width-el.offsetWidth;el.style.setProperty('left','auto','important');el.style.setProperty('right','0px','important');}else{el.style.setProperty('left',x+'px','important');el.style.setProperty('right','auto','important');}el.style.setProperty('top',y+'px','important');el.style.setProperty('bottom','auto','important');return {x,y};}
function restoreFloat(el){const p=S.floatPositions?.[el.dataset.float];if(p){const b=floatBounds(el);putFloat(el,p.x*b.width,p.y*b.height);}}
function bindFloatingControls(){document.querySelectorAll('[data-float]').forEach(el=>{restoreFloat(el);let press=null,timer=null,blockUntil=0;const stopTimer=()=>{clearTimeout(timer);timer=null;};
el.addEventListener('contextmenu',e=>e.preventDefault());
el.addEventListener('pointerdown',e=>{if(!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;stopTimer();const rect=el.getBoundingClientRect(),app=document.querySelector('.app').getBoundingClientRect();press={id:e.pointerId,x:e.clientX,y:e.clientY,left:rect.left-app.left,top:rect.top-app.top,active:false,cancelled:false};el.setPointerCapture?.(e.pointerId);timer=setTimeout(()=>{if(!press||press.cancelled)return;press.active=true;blockUntil=Date.now()+800;el.classList.add('is-dragging');},360);});
el.addEventListener('pointermove',e=>{if(!press||e.pointerId!==press.id)return;const dx=e.clientX-press.x,dy=e.clientY-press.y;if(!press.active){if(Math.hypot(dx,dy)>9){stopTimer();press.cancelled=true;blockUntil=Date.now()+800;}return;}e.preventDefault();putFloat(el,press.left+dx,press.top+dy);});
const end=e=>{if(!press||e.pointerId!==press.id)return;stopTimer();if(press.active){const rect=el.getBoundingClientRect(),app=document.querySelector('.app').getBoundingClientRect(),b=floatBounds(el);const p=putFloat(el,rect.left-app.left,rect.top-app.top);(S.floatPositions||={})[el.dataset.float]={x:p.x/b.width,y:p.y/b.height};save();blockUntil=Date.now()+800;}else if(press.cancelled)blockUntil=Date.now()+800;press=null;el.classList.remove('is-dragging');if(el.hasPointerCapture?.(e.pointerId))el.releasePointerCapture(e.pointerId);};
el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('click',e=>{if(Date.now()<blockUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
});}
const mountBeforeDrag=mountVoice;
mountVoice=function(){mountBeforeDrag();bindFloatingControls();};
window.addEventListener?.('resize',()=>document.querySelectorAll('[data-float]').forEach(restoreFloat));
mountVoice();

const goBeforeDock=go;
go=function(page){pageDockOpen=false;goBeforeDock(page);};
document.addEventListener('click',e=>{if(!pageDockOpen||e.target.closest('.page-fab'))return;pageDockOpen=false;const el=document.querySelector('.page-fab');if(el){el.classList.remove('is-open');el.setAttribute('aria-expanded','false');el.setAttribute('aria-label','展开页面切换');}});
