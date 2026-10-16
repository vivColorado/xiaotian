/* Presence-aware demo delivery. Scheduling, delivery and attendance are separate records. */
const DEMO_DAY='2026-10-15';
const SWIM_REQUEST='今天晚 8 点我要去游泳，提前半小时通知我。';
I.bell='M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4';
I.summary='M5 3h14v18H5zM8 8h8M8 12h5M8 16h6';
let liveNotice=null,liveNoticeTimer=null,simulatedAway=false;
function initDelivery(){
 S.delivery||={away:false,queue:[],sequence:0};S.delivery.queue||=[];S.reminders||=[];
 if(!S.v33){
  S.fixedDemoAt=DEMO_DAY+'T18:45:00+08:00';
  // Re-anchor built-in daily examples without clearing user-created tasks or messages.
  const onDemoDate=value=>typeof value==='string'?value.replace(/2026-\d\d-\d\d(?=T)/g,DEMO_DAY).replace(/10\/\d\d(?=\s\d\d:)/g,'10/15'):value;
  for(const task of S.items.filter(t=>t.id==='shop'||t.id.startsWith('case_'))){
   for(const key of ['created','startedAt','scheduledStart','finished','waitSince'])if(task[key])task[key]=onDemoDate(task[key]);
   for(const row of [...(task.steps||[]),...(task.confirmations||[]),...(task.updates||[])])for(const key of ['at','end','answeredAt'])if(row[key])row[key]=onDemoDate(row[key]);
  }
  if(S.shoppingStory)S.shoppingStory.date=DEMO_DAY;
  for(const occurrence of S.instances.filter(t=>t.parent==='swim_daily'&&t.status==='done'&&!t.closeReason)){
   if(ts(occurrence.scheduledStart)>now().getTime()){occurrence.status='todo';occurrence.archive=null;occurrence.result='';occurrence.summary='19:00 到点提醒，去游泳需要您本人线下参与。';}
  }
  S.timelineScroll=null;S.calendarZoomed=false;S.v33=true;save();
 }
}
function demoClockLabel(){return '10 月 15 日 · '+fmt(now().toISOString()).slice(-5);}
function deliveryControls(){return `<details class="delivery-controls" data-chat-fold="delivery-tools"><summary><span>${demoClockLabel()}</span><span>体验消息流程 <i>⌄</i></span></summary><div class="delivery-demo-buttons"><button onclick="demoOnlineUpdate()">App 内收到进展</button><button onclick="demoLeaveApp()">离开后再回来</button><button onclick="requestTaskDigest()">全部任务怎么样</button><button onclick="demoCreateSwim()">设置今晚游泳提醒</button><button onclick="demoReminderTime()">时间到 19:30</button></div><p>固定日期的模拟演示，可逐项体验。</p></details>`;}
function appIsPresent(){return !S.delivery?.away&&document.visibilityState!=='hidden';}
function nextDeliveryKey(prefix='event'){S.delivery.sequence=(S.delivery.sequence||0)+1;return prefix+'-'+S.delivery.sequence;}
function normalizeDeliveryMessage(message){
 message.deliveryKey||=nextDeliveryKey();
 // Periodic reminders also use the notification language, never a completion task card.
 if(message.snapshot?.id&&entity(message.snapshot.id)?.reminderOnly&&entity(message.snapshot.id)?.parent&&message.action==='完成'){
  const t=entity(message.snapshot.id);return {kind:'reminder_notice',deliveryKey:message.deliveryKey,id:t.id,at:message.at,notice:{title:t.title.replace(/^提醒/,''),eventAt:t.scheduledStart||t.due,notifyAt:t.scheduledStart||t.due,checklist:[],recordId:'',repeat:true}};
 }
 return message;
}
function publishMessage(message){
 initDelivery();message=normalizeDeliveryMessage(message);
 if(!appIsPresent()){S.delivery.queue.push(message);save();return;}
 S.messages.push(message);save();
 if(S.page!=='home'||detailID){showLiveNotice(message.kind==='reminder_notice'?'到点提醒':message.snapshot?.status==='wait_user'?'有一件事需要您确认':'小天有新进展',message.notice?.title||message.snapshot?.title||'查看最新消息');}
}
function showLiveNotice(label,title){
 liveNotice={label,title};clearTimeout(liveNoticeTimer);mountVoice();
 liveNoticeTimer=setTimeout(()=>{liveNotice=null;mountVoice();},6500);
}
function openLiveNotice(){liveNotice=null;go('home');jumpConversationLatest();}
const mountBeforeDelivery=mountVoice;
mountVoice=function(){mountBeforeDelivery();if(liveNotice)document.getElementById('floating').insertAdjacentHTML('beforeend',`<button class="inapp-notice" style="top:${(document.querySelector('.top')?.offsetHeight||68)+8}px" role="status" onclick="openLiveNotice()"><span>${icon('bell')}</span><span><small>${esc(liveNotice.label)}</small><strong>${esc(liveNotice.title)}</strong></span><span>查看 ›</span></button>`);};
function digestBucket(t){if(['paused','cancelled','error'].includes(t.status))return 'other';if(needUser(t))return 'help';return t.status==='done'?'done':'active';}
function digestData(tasks){
 const cards=[...new Map(tasks.filter(Boolean).map(t=>[t.id,snapshot(t)])).values()];
 const order={help:0,other:1,active:2,done:3};cards.sort((a,b)=>order[digestBucket(a)]-order[digestBucket(b)]);
 const counts={help:0,active:0,done:0,other:0};cards.forEach(t=>counts[digestBucket(t)]++);return {cards,counts};
}
function digestText(counts,scope){
 const total=Object.values(counts).reduce((a,b)=>a+b,0);if(!total)return '目前没有需要汇报的任务，有事随时吩咐我。';
 const lead=scope==='away'?`您离开这会儿，${total} 项有新进展。`:`已整理好 ${total} 项任务的近况。`;
 return lead+(counts.help?`先看这 ${counts.help} 项需您协助的事。`:'进展和结果都在下面。');
}
function appendDigest(tasks,scope='all',input='',sourceEvents=[]){
 const data=digestData(tasks);const message={kind:'task_digest',scope,input,...data,text:digestText(data.counts,scope),at:now().toISOString(),deliveryKey:nextDeliveryKey('digest'),sourceEvents};
 S.messages.push(message);save();return message;
}
function requestTaskDigest(text='全部任务怎么样？'){
 appendDigest(S.items.filter(t=>t.archive!=='archived'),'all',text);save();go('home');jumpConversationLatest();
}
function leaveApp(){if(listening)stopDictation();if(!S.delivery.away){S.delivery.away=true;S.delivery.leftAt=now().toISOString();}save();}
function returnToApp(){
 const hadAway=S.delivery.away;S.delivery.away=false;simulatedAway=false;
 document.getElementById('presence-overlay')?.remove();
 const queued=S.delivery.queue.splice(0).map(normalizeDeliveryMessage),updates=queued.filter(m=>m.kind!=='reminder_notice'),notices=queued.filter(m=>m.kind==='reminder_notice');
 if(updates.length){
  const latest=new Map();updates.forEach(m=>{for(const t of m.cards||[m.snapshot].filter(Boolean))latest.set(t.id,t);});
  if(latest.size)appendDigest([...latest.values()].map(t=>entity(t.id)||t),'away','',updates);
 }
 // Timely reminders remain separate even if ordinary progress is summarized.
 for(const message of notices){message.returned=true;S.messages.push(message);}
 save();if(hadAway||queued.length){render();if(queued.length){if(S.page==='home')jumpConversationLatest();else showLiveNotice(notices.length?'有待办提醒':'离开期间的汇报',notices.length?'提醒已为您单独保留':`${updates.length} 条进展已汇总`);}}
}
function digestRow(t){return `<button class="digest-row" onclick="detail('${t.id}')"><span class="digest-state-dot" data-state="${t.status}"></span><span class="digest-row-copy"><span><strong>${esc(t.title)}</strong><small>${esc(STATUS[t.status]||'待启动')}</small></span><p>${esc(t.plan||t.summary||'等待下一步安排')}</p></span><span class="digest-row-arrow">›</span></button>`;}
function digestCard(m,key){const n=m.cards.length;return `<section class="digest-card" aria-label="${m.scope==='away'?'离开期间进展汇总':'全部任务汇总'}"><header><span class="digest-mark">${icon('summary')}</span><span><strong>${m.scope==='away'?'离开期间的进展':'任务近况'}</strong><small>${fmt(m.at)} · ${n} 项${m.scope==='away'?'有变化':''}</small></span></header><div class="digest-metrics">${[['help','需您协助'],['active','在推进'],['done','已完成'],['other','其他状态']].filter(([k])=>m.counts[k]).map(([k,l])=>`<span class="${k}"><b>${m.counts[k]}</b>${l}</span>`).join('')}</div>${n?`<div class="digest-list">${m.cards.slice(0,3).map(digestRow).join('')}</div>${n>3?`<details class="digest-more" data-chat-fold="digest-${esc(key)}"><summary><span class="more-closed">其余 ${n-3} 项</span><span class="more-open">收起其余任务</span><i>⌄</i></summary><div class="digest-list">${m.cards.slice(3).map(digestRow).join('')}</div></details>`:''}`:'<p class="digest-empty">有新的安排，随时吩咐我。</p>'}</section>`;}
function reminderCard(m){
 const n=m.notice,r=S.reminders.find(x=>x.id===n.recordId),answered=r?.acknowledged||false;
 const superseded=r&&r.revision!==(n.revision||1),snoozed=r?.notifyAt&&ts(r.notifyAt)>ts(n.notifyAt);
 const remaining=Math.max(0,Math.ceil((ts(n.eventAt)-Math.max(ts(n.notifyAt),ts(m.at)))/60000));
 const late=now().getTime()>ts(n.eventAt),head=m.returned?(late?'离开期间的提醒 · 已过原定时间':'离开期间的提醒'):'待办提醒';
 return `<article class="reminder-message" aria-label="${esc(head)}：${esc(n.title)}"><div class="reminder-kicker">${icon('bell')}<strong>${head}</strong><time>${fmt(m.at).slice(-5)}</time></div><div class="reminder-main"><div class="reminder-time">${fmt(n.eventAt).slice(-5)}<small>今天</small></div><div><h3>${esc(n.title)}</h3><p>${late?'原定时间已过，请按您的实际安排处理。':n.repeat?'到时间了，记得给自己留一点活动时间。':remaining?'还有 '+remaining+' 分钟，准备一下再出发。':'到约定时间了，按您的安排出发。'}</p></div></div>${n.checklist.length?`<div class="reminder-checklist"><span>带上</span>${n.checklist.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}${r?`<div class="reminder-actions">${r.cancelled?'<span>已取消后续提醒</span>':superseded?'<span>提醒安排已更新</span>':answered?'<span>✓ 您已知晓</span>':snoozed?`<span>已改为 ${fmt(r.notifyAt).slice(-5)} 再提醒</span>`:`<button onclick="ackReminder('${r.id}')">知道了</button>${!late?`<button onclick="snoozeReminder('${r.id}')">10 分钟后再提醒</button>`:''}`}<button class="reminder-detail" onclick="detail('${r.taskId}')" aria-label="查看提醒安排">安排 ›</button></div>`:`<div class="reminder-actions"><button onclick="detail('${m.id}')">查看安排 ›</button></div>`}</article>`;
}
const renderMessageBeforeDelivery=conversationMessage;
conversationMessage=function(m,index){
 if(m.kind==='task_digest')return chatTurn(m.deliveryKey||'digest-'+index,{input:m.input,text:m.text,cards:digestCard(m,m.deliveryKey||index)});
 if(m.kind==='reminder_notice')return `<section class="chat-turn reminder-turn" data-chat-entry="${esc(m.deliveryKey)}">${reminderCard(m)}</section>`;
 return renderMessageBeforeDelivery(m,index);
};
function createSwimReminder(text=SWIM_REQUEST){
 const taskId='reminder_swim_tonight',eventAt=DEMO_DAY+'T20:00:00+08:00',plannedNotifyAt=DEMO_DAY+'T19:30:00+08:00';
 const notifyAt=now().getTime()>ts(plannedNotifyAt)?now().toISOString():plannedNotifyAt;
 let task=item(taskId),r=S.reminders.find(x=>x.taskId===taskId);
 if(r&&!r.cancelled){S.messages.push({kind:'direct',input:text,text:`已安排好了：${fmt(r.notifyAt).slice(-5)} 提醒您 20:00 游泳，不会重复创建。`,at:now().toISOString()});save();return [taskId];}
 if(now().getTime()>=ts(eventAt)){S.messages.push({kind:'direct',input:text,text:'今晚 20:00 已过，您想改到什么时间？',at:now().toISOString()});save();return [];}
 const summary=`${fmt(notifyAt).slice(-5)} 提醒您 20:00 去游泳，并附物品清单。`;
 const setup={id:taskId,title:'提醒今晚游泳',theme:'生活照料',kind:'oneoff',status:'done',reminderSetup:true,person:false,source:'user',created:now().toISOString(),finished:now().toISOString(),quote:text,summary,plan:summary,result:summary+' 已完成的是提醒设置；是否到场由您确认。',archive:null,confirmations:[],steps:[{title:'确定时间与提前量',status:'done',summary:'今晚 20:00 游泳，提前 30 分钟。',at:fmt(now().toISOString())},{title:'设置提醒并准备清单',status:'done',summary:`${fmt(notifyAt).slice(-5)} 通知；泳衣、泳帽、泳镜、毛巾、水。`,at:fmt(now().toISOString())}]};
 if(task)Object.assign(task,setup);else{task=setup;S.items.push(task);}
 const revision=(r?.revision||0)+1,record={id:'reminder_swim_notice',taskId,eventAt,notifyAt,plannedNotifyAt,revision,deliveredKeys:[],acknowledged:false,cancelled:false,checklist:['泳衣','泳帽','泳镜','毛巾','水']};
 if(r)Object.assign(r,record);else{r=record;S.reminders.push(r);}
 const activity={id:'activity_swim_tonight',parent:taskId,title:'今晚去游泳',kind:'instance',person:true,status:'todo',scheduledStart:eventAt,due:eventAt,created:now().toISOString(),managedReminder:true,summary:`20:00 游泳，${fmt(notifyAt).slice(-5)} 提醒；需要您本人到场。`,confirmations:[]};
 const existing=inst(activity.id);if(existing)Object.assign(existing,activity);else S.instances.push(activity);
 // Tonight's explicit plan replaces just tonight's old recurring demo occurrence.
 const old=inst('swim_'+DEMO_DAY);if(old){old.status='cancelled';old.archive='archived';old.summary='今晚改为 20:00 游泳，由 19:30 提醒负责。';}
 const card=snapshot(task);card.receiptAction='更新';
 publishMessage({kind:'task_receipt',id:taskId,input:text,text:ts(notifyAt)>ts(plannedNotifyAt)?'已为您创建提醒。提前半小时的时间已过，我现在提醒您。':'已为您创建提醒。',action:'完成',snapshot:card,at:now().toISOString()});save();checkReminderSchedule();return [taskId];
}
function checkReminderSchedule(){
 let changed=false;
 for(const r of S.reminders||[]){
  const activity=inst('activity_swim_tonight');if(activity?.parent===r.taskId&&activity.status==='todo'&&ts(r.eventAt)<=now().getTime()){activity.status='wait_user';activity.summary='原定 20:00 去游泳，是否到场请您按实际情况确认。';changed=true;}
  if(r.cancelled)continue;
  const occurrence=r.revision+'@'+r.notifyAt;
  if(ts(r.notifyAt)>now().getTime()||(r.deliveredKeys||[]).includes(occurrence))continue;
  (r.deliveredKeys||=[]).push(occurrence);
  publishMessage({kind:'reminder_notice',id:r.taskId,at:r.notifyAt,notice:{recordId:r.id,revision:r.revision,title:'该准备去游泳了',eventAt:r.eventAt,notifyAt:r.notifyAt,checklist:[...r.checklist]}});changed=true;
 }
 if(changed)save();return changed;
}
function ackReminder(id){const r=S.reminders.find(x=>x.id===id);if(!r)return;r.acknowledged=true;save();refreshPreserving();}
function snoozeReminder(id){
 const r=S.reminders.find(x=>x.id===id);if(!r||r.cancelled||r.acknowledged||ts(r.eventAt)<=now().getTime())return;
 r.notifyAt=new Date(Math.min(ts(r.eventAt),now().getTime()+600000)).toISOString();save();refreshPreserving();
}
function cancelReminder(id){
 const r=S.reminders.find(x=>x.id===id);if(!r||r.cancelled)return;r.cancelled=true;
 const t=item(r.taskId);t.summary='已取消后续提醒；此前的设置完成记录保留。';t.result=t.summary;t.updatedAt=now().toISOString();
 S.delivery.queue=S.delivery.queue.filter(m=>m.notice?.recordId!==id);save();refreshPreserving();
}
const processBeforeDelivery=processInput;
processInput=function(text,context=''){
 if(!context&&/任务|事情|进展/.test(text)&&/怎么样|如何|进展|进度|汇总|情况/.test(text)&&!/取消|暂停|删除/.test(text)){appendDigest(S.items.filter(t=>t.archive!=='archived'),'all',text);return [];}
 if(!context&&/游泳/.test(text)&&/提醒|通知/.test(text)){
  if(!/明天|后天|每天|每日|每周/.test(text)&&/(?:晚|晚上|今晚)\s*(?:8|八)\s*点|20[:：]00/.test(text)&&/半小时|30\s*分钟/.test(text))return createSwimReminder(text);
  S.messages.push({kind:'direct',input:text,text:'本轮先体验固定场景，请试试“今晚 8 点游泳，提前半小时通知我”。',at:now().toISOString()});save();return [];
 }
 return processBeforeDelivery(text,context);
};
const reconcileBeforeDelivery=reconcile;
reconcile=function(){const reminders=checkReminderSchedule(),tasks=reconcileBeforeDelivery();return reminders||tasks;};
function setDemoTime(time){
 const target=DEMO_DAY+'T'+time+':00+08:00';if(ts(target)<now().getTime())return false;
 S.fixedDemoAt=target;reconcile();save();render();return true;
}
advanceTime=function(hours){const target=Math.min(ts(DEMO_DAY+'T23:59:00+08:00'),now().getTime()+hours*3600000);S.fixedDemoAt=new Date(target).toISOString();reconcile();save();closeModal();render();};
function seedDeliveryCases(){
 const specs=[['demo_report','整理周末出行清单','生活照料'],['demo_train','查询家人车票','家人出行'],['demo_compare','比较净水器滤芯价格','生活照料']];
 for(const [id,title,theme]of specs)if(!item(id))S.items.push({id,title,theme,kind:'oneoff',status:'running',source:'user',created:DEMO_DAY+'T18:40',quote:'帮我'+title,summary:'正在整理资料。',plan:'整理信息，核对后汇报。',confirmations:[],steps:[]});
}
function simulateOneUpdate(){
 seedDeliveryCases();const step=(S.delivery.demoStep||0)%3;S.delivery.demoStep=(S.delivery.demoStep||0)+1;
 const specs=[['demo_report','done','已整理证件、衣物与常备用品清单。'],['demo_train','wait_user','请确认从广州南站还是广州站出发。'],['demo_compare','running','已比较 3 家报价，继续核对规格与运费。']];
 const [id,status,summary]=specs[step],t=item(id);t.status=status;t.summary=summary;t.updatedAt=now().toISOString();if(status==='done'){t.result=summary;t.finished=now().toISOString();}
 t.confirmations=status==='wait_user'?[{id:'depart',question:summary,at:now().toISOString(),blocking:true,options:['广州南站','广州站']}]:[];
 receipt(t,status==='wait_user'?'有一处需要您确认。':status==='done'?'清单整理好了。':'价格比较有新进展。',status==='done'?'完成':'更新');save();
}
function demoOnlineUpdate(){if(S.delivery.away)return;simulateOneUpdate();render();jumpConversationLatest();}
function demoLeaveApp(){
 if(S.delivery.away)return;leaveApp();simulatedAway=true;simulateOneUpdate();simulateOneUpdate();simulateOneUpdate();
 const app=document.querySelector('.app');app.insertAdjacentHTML('beforeend',`<section id="presence-overlay" class="presence-overlay" aria-label="模拟离开 App"><span class="away-mark">${icon('leaf')}</span><h2>您先忙自己的</h2><p>已模拟离开小天。<br>这期间的 3 项进展，回来时一起汇报。</p><button class="primary" onclick="returnToApp()">回到小天</button><button class="away-reminder" onclick="demoAwayReminder()">也模拟离开期间到 19:30</button><small>仅演示离开状态，不会关闭当前网页。</small></section>`);
}
function demoCreateSwim(){if(S.delivery.away)return;createSwimReminder();save();go('home');jumpConversationLatest();}
function demoReminderTime(){
 if(!S.reminders.some(r=>r.taskId==='reminder_swim_tonight'&&!r.cancelled))createSwimReminder();
 if(!setDemoTime('19:30')){checkReminderSchedule();render();}
 go('home');jumpConversationLatest();
}
function demoAwayReminder(){
 if(!S.reminders.some(r=>r.taskId==='reminder_swim_tonight'&&!r.cancelled))createSwimReminder();
 if(now().getTime()<ts(DEMO_DAY+'T19:30'))S.fixedDemoAt=DEMO_DAY+'T19:30:00+08:00';checkReminderSchedule();save();
 const button=document.querySelector('.away-reminder');if(button){button.textContent='19:30 提醒已产生，回来单独查看';button.disabled=true;}
}
const progressBeforeDelivery=latestTaskState;
latestTaskState=function(t){
 const base=progressBeforeDelivery(t),r=S.reminders.find(x=>x.taskId===t.id);if(!r)return base;
 const state=r.cancelled?'已取消后续提醒':r.acknowledged?'已通知，您已知晓':(r.deliveredKeys||[]).includes(r.revision+'@'+r.notifyAt)?'已发出提醒，等待您回应':`${fmt(r.notifyAt).slice(-5)} 将通知您`;
 return base.replace('</div></details>',`<div class="reminder-schedule-info"><span>${icon('bell')} ${esc(state)}</span><p>20:00 游泳 · ${r.checklist.map(esc).join('、')}</p>${!r.cancelled?`<button onclick="cancelReminder('${r.id}')">取消后续提醒</button>`:''}<small>完成的是提醒设置；“知道了”不代表已去游泳。</small></div></div></details>`);
};
function bindDetailDismiss(){
 const panel=document.querySelector('.task-detail-sheet');if(!panel||panel.dataset.swipeBound)return;panel.dataset.swipeBound='true';
 let gesture=null,blockUntil=0;
 panel.addEventListener('touchstart',e=>{gesture=null;if(e.touches.length!==1||e.target.closest('input,textarea,select,[contenteditable="true"],.pdf-frame'))return;gesture={x:e.touches[0].clientX,y:e.touches[0].clientY,axis:null};},{passive:true});
 panel.addEventListener('touchmove',e=>{if(!gesture)return;if(e.touches.length!==1){gesture=null;return;}const dx=e.touches[0].clientX-gesture.x,dy=e.touches[0].clientY-gesture.y;if(!gesture.axis&&Math.max(Math.abs(dx),Math.abs(dy))>12)gesture.axis=Math.abs(dx)>Math.abs(dy)*1.5?'x':'y';if(gesture.axis==='x'&&dx<0&&e.cancelable)e.preventDefault();},{passive:false});
 panel.addEventListener('touchend',e=>{if(!gesture||!e.changedTouches.length)return;const p=gesture;gesture=null;const dx=e.changedTouches[0].clientX-p.x,dy=e.changedTouches[0].clientY-p.y;if(p.axis!=='y'&&dx< -70&&Math.abs(dx)>Math.abs(dy)*1.5){blockUntil=Date.now()+500;suppressSwipeClickUntil=blockUntil;closeModal();}},{passive:true});
 panel.addEventListener('touchcancel',()=>gesture=null,{passive:true});
 panel.addEventListener('click',e=>{if(Date.now()<blockUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
}
const detailBeforeDelivery=detail;
detail=function(id){detailBeforeDelivery(id);bindDetailDismiss();const panel=document.querySelector('.task-detail-sheet');const heading=panel?.querySelector('.sheetheader');if(heading&&!heading.querySelector('.detail-swipe-tip'))heading.insertAdjacentHTML('afterend','<div class="detail-swipe-tip">左滑关闭</div>');};
demoSettings=function(){sheet('演示消息流程',deliveryControls());};
initDelivery();
// Visibility changes are real lifecycle events; the scenario buttons exercise the same queue.
const deliveryLifecycle=e=>{if(document.visibilityState==='hidden')leaveApp();else if(!simulatedAway){checkReminderSchedule();returnToApp();}};
document.addEventListener('visibilitychange',deliveryLifecycle);
window.addEventListener?.('pagehide',leaveApp);
window.addEventListener?.('pageshow',()=>{if(!simulatedAway){checkReminderSchedule();returnToApp();}});
if(S.delivery.away&&document.visibilityState!=='hidden'){checkReminderSchedule();returnToApp();}
setInterval(()=>{if(checkReminderSchedule()&&appIsPresent())refreshPreserving();},1000);
render();
