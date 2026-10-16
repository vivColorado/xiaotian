/* Three pages, one light edge dock. Native inner scrolling owns its gestures. */
const MAIN_PAGES=[['home','吩咐我','chat'],['overview','工作台','report'],['space','个人空间','leaf']];
const pageReadingPositions={overview:0,space:0};
function adjacentPage(page,dx){const i=MAIN_PAGES.findIndex(p=>p[0]===page);return i<0?null:MAIN_PAGES[i+(dx<0?1:-1)]?.[0]||null;}
function pageDockMarkup(){
 return '<button class="page-fab '+(pageDockOpen?'is-open':'')+'" data-float="page" onclick="pageDockAction()" aria-expanded="'+pageDockOpen+'" aria-controls="page-dock-menu" aria-label="'+(pageDockOpen?'收起页面切换':'展开三个页面的切换')+'" title="点击展开，长按上下移动"><span class="dock-grip" aria-hidden="true">'+(pageDockOpen?'›':'‹')+'</span><span class="dock-destination">切换页面</span></button>'+(pageDockOpen?'<nav class="page-dock-menu" id="page-dock-menu" aria-label="主页面切换">'+MAIN_PAGES.map(([id,label,ic],i)=>'<button class="'+(S.page===id?'selected':'')+'" aria-current="'+(S.page===id?'page':'false')+'" onclick="go(\''+id+'\')">'+icon(ic)+label+'<small>'+(i+1)+'/3</small></button>').join('')+'<p>左右滑动，也可以切换</p></nav>':'');
}
pageDockAction=function(){pageDockOpen=!pageDockOpen;mountVoice();};
const navigationMount=mountVoice;
mountVoice=function(){
 navigationMount();
 if(!pageDockOpen)return;
 const menu=document.getElementById('page-dock-menu'),button=document.querySelector('.page-fab'),app=document.querySelector('.app');
 if(!menu||!button||!app)return;
 const rect=button.getBoundingClientRect(),ar=app.getBoundingClientRect();
 menu.style.top=Math.max(12,Math.min(rect.top-ar.top-150,app.clientHeight-210))+'px';
 menu.style.bottom='auto';
};
function updatePagePosition(){
 const el=document.getElementById('page-position');if(!el)return;
 const index=MAIN_PAGES.findIndex(p=>p[0]===S.page),label=MAIN_PAGES[index]?.[1]||'吩咐我';
 el.innerHTML=MAIN_PAGES.map((_,i)=>'<i class="'+(i===index?'active':'')+'"></i>').join('')+'<span>'+(index+1)+' / 3</span>';
 el.setAttribute('aria-label',label+'，第 '+(index+1)+' 页，共 3 页。可左右滑动切换，或点击右侧悬浮入口。');
}
function capturePagePosition(){const main=document.getElementById('main');if(main.dataset.page==='space'||main.dataset.page==='overview')pageReadingPositions[main.dataset.page]=main.scrollTop;}
const navigationRender=render;
render=function(){capturePagePosition();navigationRender();if(S.page!=='home')document.getElementById('main').scrollTop=pageReadingPositions[S.page]||0;updatePagePosition();};
const navigationGo=go;
go=function(page){
 if(!MAIN_PAGES.some(p=>p[0]===page))return;
 capturePagePosition();navigationGo(page);
 if(page!=='home')document.getElementById('main').scrollTop=pageReadingPositions[page]||0;
 updatePagePosition();
};
document.getElementById('main').addEventListener('scroll',capturePagePosition,{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pageDockOpen){pageDockOpen=false;mountVoice();}});
render();
