/* One day, one task, several useful moments; memories stay linked to their source. */
const OUTING_DATE='2026-10-10';
const OUTING_PACK=['小孩水杯','零食','备用衣服','纸尿裤','餐具、辅食剪刀、勺子、围兜','湿纸巾','便携风扇','装红薯的塑料袋'];
const OUTING_STEPS=[
 {time:'08:30',input:'这个挖红薯的活动看着不错，你帮我安排一下，我带娃去。',text:'安排成不赶路的一天：上午挖红薯，中午好好吃饭，下午看小包状态再逛。',title:'带小包挖红薯',status:'wait_user',summary:'路线、停车、用餐和洗手间已放进计划，等您确认。',type:'plan',next:'看着不错，就这么安排吧'},
 {time:'08:35',input:'看着不错，就这么安排吧。',text:'好，我来接着安排。您先收拾出门要带的东西，今天不用赶。',status:'running',summary:'行程已确认，出门清单备好了。',type:'receipt',next:'出门前，帮我检查带哪些东西'},
 {time:'09:00',input:'出门前，帮我检查带哪些东西。',text:'按小包出门和下地活动整理好了。检查一件，勾一件。',status:'running',summary:'出门清单已推送。',type:'packing',next:'我出发了，上午说的挖红薯那地，导航下'},
 {time:'09:10',input:'我出发了，上午说的挖红薯那地，导航下。',text:'导航已模拟推送到车机，目的地是农场停车区。停好车先去入口洗手间，再下地。',status:'running',summary:'去程导航已模拟推送，停车区与入口动线已整理。',type:'navigation',destination:'亲子农场 · 入口停车区',next:'分享小包挖红薯的照片'},
 {time:'10:40',input:'小包玩得很开心，成小花猫啦。',text:'哈哈，小花猫收获满满！这一刻值得好好收起来。',status:'running',summary:'收到活动照片与感受，留作晚间回顾。',type:'photo',next:'快结束了，附近找个吃饭的地方吧'},
 {time:'11:20',input:'快结束了，附近找个吃饭的地方吧。',text:'优先挑了现炒、有宝宝椅、停车方便的两家。给小包的菜可以单独做不辣。',status:'wait_user',summary:'两家餐厅备选，等您选定后模拟预约。',type:'restaurants',next:'去这个湘菜馆吧'},
 {time:'11:25',input:'去这个湘菜馆吧。',text:'选好了，已模拟预约 12:00、2 大 1 小，备注宝宝椅和孩子的菜不辣。导航已模拟推送到车机。',status:'running',summary:'湘菜馆预约与导航已模拟完成。',type:'navigation',destination:'湘味小馆 · 餐厅停车区',next:'吃完了，去你说的那个商场吧'},
 {time:'13:10',input:'吃完了，去你说的那个商场吧。',text:'商场路线已模拟推送。会员可免 2 小时停车，您可以在这里选择模拟领取。困了就早点回家。',status:'running',summary:'商场导航已模拟推送；停车优惠等待您选择领取。',type:'mall',destination:'附近商场 · 地下停车场',next:'准备回家了'},
 {time:'15:40',input:'准备回家了。',text:'回家路线已模拟推送。停车账单算好了，请您确认后再支付。',status:'wait_user',summary:'回家导航已模拟推送，停车账单待确认。',type:'payment',next:'确认，模拟支付停车费'},
 {time:'15:42',input:'确认，模拟支付停车费。',text:'停车费已模拟支付。回去歇一歇，今天的回忆，晚上一起收好。',status:'running',summary:'停车费用已确认并模拟支付，等待晚间回顾。',type:'paid',next:'看看晚上的小天'},
 {time:'20:30',input:'',text:'今天小包挖红薯开心吗？又一起打卡了一个新地方，也解锁了第一次挖红薯。满满的一天，已经帮您收进个人空间。',status:'done',summary:'行程已结束，生活状态、足迹和小包第一次已关联保存。',type:'memory'}
];
function outingState(){return S.outing||(S.outing={step:-1,packed:[],coupon:false,payment:'pending'});}
function outingTask(){
 let t=item('outing-sweet-potato');
 if(!t){t={id:'outing-sweet-potato',managedOuting:true,title:'带小包挖红薯',theme:'家人出行',kind:'oneoff',status:'wait_user',person:true,source:'user',created:OUTING_DATE+'T08:30',due:OUTING_DATE+'T09:30',quote:OUTING_STEPS[0].input,summary:OUTING_STEPS[0].summary,steps:[],confirmations:[],archive:null};S.items.push(t);}
 return t;
}
function outingEntry(){
 const o=outingState();
 return '<section class="outing-entry"><span class="outing-entry-icon">'+icon('sun')+'</span><div><small>上周六 · 10.10 · 亲子出游</small><b>把一个周末，过成一段回忆。</b><p>从挖红薯的安排，到个人空间里的新留痕。</p><div class="outing-entry-actions"><button onclick="startOutingStory()">'+(o.step<0?'一步步体验 →':o.step<10?'继续这一天 →':'回看这一天 →')+'</button>'+(o.step<10?'<button onclick="replayOutingStory()">完整回放</button>':'<button onclick="jumpToOutingMemory()">查看留痕 ↗</button>')+'</div></div></section>';
}
function applyOutingStep(step,{payment,userInput}={}){
 const o=outingState();if(step!==o.step+1||step<0||step>=OUTING_STEPS.length)return false;
 const existing=item('outing-sweet-potato');if(existing&&['paused','cancelled'].includes(existing.status)){toast(existing.status==='paused'?'这件事已暂停，请先在任务详情中恢复。':'这件事已取消，已有回忆仍保留。');return false;}
 const s=OUTING_STEPS[step],t=outingTask();
 if(step===9)o.payment=payment==='self'?'self':'simulated';
 Object.assign(t,{status:s.status,summary:s.summary,updatedAt:OUTING_DATE+'T'+s.time,archive:s.status==='done'?'pending':null});
 t.steps.push({title:step===0?'整理出行计划':s.summary,status:'done',summary:s.text,at:'10/10 '+s.time});
 const bill=outingBill();
 if(step===9&&o.payment==='self')t.summary='您选择自行支付停车费；回家导航已模拟推送。';
 if(step===10){t.finished=OUTING_DATE+'T20:30';t.result='已生成“带小包挖红薯去咯”生活记录，关联亲子农场足迹和小包第一次挖红薯。';saveOutingMemories();}
 o.step=step;
 S.messages.push({kind:'outing_scene',step,input:userInput??(step===9&&o.payment==='self'?'停车费我自己付。':s.input),text:step===9&&o.payment==='self'?'好的，停车费交给您处理。今天的回忆，晚上一起收好。':s.text,at:OUTING_DATE+'T'+s.time,snapshot:snapshot(t),bill,payment:o.payment,coupon:o.coupon});
 save();return true;
}
function startOutingStory(){
 if(outingState().step<0)applyOutingStep(0);
 closeModal();go('home');jumpConversationLatest();
}
function advanceOuting(expected,payment=''){
 if(outingState().step!==expected)return;
 if(!applyOutingStep(expected+1,{payment}))return;render();jumpConversationLatest();
}
function replayOutingStory(){
 const o=outingState();for(let i=o.step+1;i<OUTING_STEPS.length;i++)applyOutingStep(i,{payment:'simulated'});
 closeModal();go('home');jumpOutingStart();
}
function jumpOutingStart(){const el=document.querySelector('[data-chat-entry="outing-0"]');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});else jumpConversationLatest();}
function returnToOuting(){closeModal();go('home');jumpOutingStart();}
function togglePacked(i){if(i<0||i>=OUTING_PACK.length)return;const o=outingState();o.packed=o.packed.includes(i)?o.packed.filter(x=>x!==i):[...o.packed,i];save();const count=document.getElementById('outing-packed-count');if(count)count.textContent=o.packed.length+'/'+OUTING_PACK.length+' 类已检查';}
function claimOutingCoupon(){
 const o=outingState();if(o.step!==7)return;
 o.coupon=true;outingTask().summary='已模拟注册会员并领取 2 小时停车优惠；实际未注册、未提交个人信息。';save();refreshPreserving();toast('已模拟领取 2 小时停车优惠。');
}
function outingBill(){return outingState().coupon?{total:18,discount:12,due:6}:{total:18,discount:0,due:18};}
function saveOutingMemories(){
 const records=ps().records;
 const shared={date:OUTING_DATE,time:'20:30',outing:true,sourceTask:'outing-sweet-potato',origin:'挖红薯会话 · 演示留痕'};
 const additions=[
  {...shared,id:'outing-memory',kind:'life',section:'life',title:'带小包挖红薯去咯',note:'小包玩得很开心，挖成了小花猫。\n上午在田野里挖红薯，中午吃了一顿热乎饭，下午逛了商场。普通的周末，又多了一个值得记住的地方。',place:'亲子农场',icon:'leaf'},
  {...shared,id:'outing-first',kind:'milestone',section:'child',title:'第一次挖红薯',note:'小手挖出了红薯，也解锁了一个新体验。和爸爸妈妈一起，把快乐带回家。',icon:'leaf'}
 ];
 additions.forEach(r=>{if(!records.some(x=>x.id===r.id))records.push(r);});
}
function jumpToOutingMemory(){
 const r=spaceRecord('outing-memory');if(!r){startOutingStory();return;}
 ps().tab='life';ps().day=OUTING_DATE;save();go('space');openSpaceRecord(r.id);
}
function outingPlan(){
 return '<section class="outing-plan"><div class="outing-card-label">'+icon('sun')+' 不赶路的亲子一天 <small>示例方案</small></div><h3>挖红薯 → 午饭 → 随心逛逛</h3><ol>'+[['09:10','出发','导航到农场入口停车区；预留 20 分钟停车、上厕所。'],['10:00','下地挖红薯','轻便鞋、备用衣服；小工具由大人照看，结束后洗手。'],['12:00','吃午饭','现炒、宝宝椅、孩子的菜不辣；餐厅旁可停车。'],['13:10','附近商场','可逛超市、换尿布、休息；洗手间和母婴室优先找好。'],['15:40','返程','看小包状态，困了就提前走。']].map(([time,title,note])=>'<li><time>'+time+'</time><div><b>'+title+'</b><p>'+note+'</p></div></li>').join('')+'</ol><p class="outing-sim-note">地点、路程、设施与营业信息为场景示例；正式出行需结合您的地址和活动链接核实。</p></section>';
}
function outingRestaurants(){
 return '<div class="outing-restaurants">'+[{name:'湘味小馆',tip:'现炒 · 可做不辣 · 有宝宝椅',extra:'车程约 12 分钟 · 门前停车 · 人均 ¥65',i:0},{name:'田园家常菜',tip:'家常现炒 · 环境宽敞 · 有宝宝椅',extra:'车程约 8 分钟 · 院内停车 · 人均 ¥55',i:1}].map(r=>'<button onclick="showOutingRestaurant('+r.i+')"><span>'+icon('pin')+'</span><div><b>'+r.name+' <small>示例</small></b><p>'+r.tip+'</p><small>'+r.extra+'</small></div><em>↗</em></button>').join('')+'</div>';
}
function showOutingRestaurant(index){
 const name=index===0?'湘味小馆':'田园家常菜';
 sheet(name+' · 候选详情','<div class="outing-restaurant-detail"><p>现炒、宝宝椅、方便停车。孩子的菜单独做不辣，过敏与忌口需在预约前补充。</p><p>建议 12:00 到店，预留 1 小时用餐；洗手间在店内。</p><p class="space-caption">这是可交互的备选详情示例，尚未查询真实餐厅、外链或预约库存。</p>'+(index===0&&outingState().step===5?'<button class="primary wide" onclick="closeModal();advanceOuting(5)">选这家，模拟预约并导航</button>':'<button class="secondary wide" onclick="closeModal()">返回对比</button>')+'</div>');
}
function outingExtra(m){
 const step=OUTING_STEPS[m.step],active=outingState().step===m.step;
 let body='';
 if(step.type==='plan')body=outingPlan();
 if(step.type==='packing')body='<section class="outing-pack"><div class="outing-card-label">'+icon('check')+' 出门前，检查一下 <small id="outing-packed-count">'+outingState().packed.length+'/'+OUTING_PACK.length+' 类已检查</small></div><div>'+OUTING_PACK.map((x,i)=>'<label><input type="checkbox" '+(outingState().packed.includes(i)?'checked':'')+' onchange="togglePacked('+i+')"><span>'+x+'</span></label>').join('')+'</div><p>红薯带土，记得多带一个袋子；小包的用品按实际需要增减。</p></section>';
 if(step.type==='navigation'||step.type==='mall')body='<div class="outing-route">'+icon('pin')+'<div><small>车机导航 · 模拟已推送</small><b>'+step.destination+'</b></div><span>↗</span></div>';
 if(step.type==='mall')body+='<div class="outing-coupon"><span>2h</span><div><b>会员停车优惠</b><p>模拟注册并领取；不提交真实信息。</p></div><button '+(!active||outingState().coupon?'disabled':'')+' onclick="claimOutingCoupon()">'+(m.coupon||outingState().coupon?'已模拟领取':'模拟领取')+'</button></div>';
 if(step.type==='restaurants')body=outingRestaurants();
 if(step.type==='payment')body='<section class="outing-bill"><div class="outing-card-label">'+icon('report')+' 停车账单 <small>模拟 · 待您确认</small></div><dl><div><dt>停车费用</dt><dd>¥'+m.bill.total+'</dd></div><div><dt>会员优惠</dt><dd>− ¥'+m.bill.discount+'</dd></div><div><dt>待支付</dt><dd>¥'+m.bill.due+'</dd></div></dl><p>不会真实扣款。付款需您确认，导航可先走。</p></section>';
 if(step.type==='paid')body='<div class="outing-payment-result">'+icon('check')+'<div><b>'+(m.payment==='self'?'您选择自行支付':'停车费 ¥'+m.bill.due+' · 已模拟支付')+'</b><small>没有真实扣款</small></div></div>';
 if(step.type==='memory')body='<button class="outing-memory" onclick="jumpToOutingMemory()">'+outingCover()+'<span><small>已收进个人空间 · 10.10</small><b>带小包挖红薯去咯</b><em>生活留痕 · 新足迹 · 小包第一次</em><strong>翻开这一天 →</strong></span></button>';
 const taskReceipt=['plan','receipt','restaurants','payment','memory'].includes(step.type)?unifiedTaskCard({...m.snapshot,receiptAction:m.step===0?'创建':m.step===10?'完成':'更新',receiptTime:'10/10 '+step.time}):'';
 const actions=active&&step.next?'<div class="outing-next"><small>体验下一幕 · '+(m.step+1)+' / '+OUTING_STEPS.length+'</small><button onclick="advanceOuting('+m.step+')">'+step.next+' →</button>'+(m.step===8?'<button class="outing-self-pay" onclick="advanceOuting(8,\'self\')">我自己支付</button>':'')+'</div>':'';
 return body+taskReceipt+actions;
}
const messageBeforeOuting=conversationMessage;
conversationMessage=function(m,index){
 if(m.kind!=='outing_scene')return messageBeforeOuting(m,index);
 let content=chatTurn('outing-'+m.step,{input:m.input,text:m.text,cards:outingExtra(m),at:m.at});
 if(m.step===4)content=content.replace('<div class="user-msg"', '<figure class="outing-user-photo">'+outingCover()+'<figcaption>照片位置示意 · 非真实照片</figcaption></figure><div class="user-msg"');
 return '<div class="outing-scene"><div class="outing-scene-time">10 月 10 日 · '+OUTING_STEPS[m.step].time+' <span>周末场景回放</span></div>'+content+'</div>';
};
const homeBeforeOuting=home;
home=function(){return homeBeforeOuting().replace(typeof deliveryControls==='function'?deliveryControls():'__no_delivery__',outingEntry()+(typeof deliveryControls==='function'?deliveryControls():''));};
const inputBeforeOuting=processInput;
processInput=function(text,context=''){
 const t=text.trim(),o=outingState();
 if(!context&&/挖红薯/.test(t)&&/安排|带娃|带小包/.test(t)&&o.step<0){applyOutingStep(0,{userInput:text});return ['outing-sweet-potato'];}
 if((!context||context==='outing-sweet-potato')&&o.step>=0&&o.step<10&&!/不要|不去|先别|取消|暂停|等等/.test(t)){
  const matches=[/就这么|按这个|安排吧/,/检查.*(带|东西)|带哪些|带什么/,/^我出发了|挖红薯.*导航/,/小包.*(小花猫|很开心)|分享.*照片/,/附近.*(吃饭|餐厅)|快结束.*吃饭/,/去.*(湘菜|湘味)/,/去.*商场/,/准备回家|^回家吧/,/^(确认|可以|好).*支付|自己.*(付|支付)/,/看看晚上|晚间回顾/];
  if(matches[o.step]?.test(t)){applyOutingStep(o.step+1,{payment:/自己/.test(t)?'self':'',userInput:text});return ['outing-sweet-potato'];}
 }
 return inputBeforeOuting(text,context);
};
const latestBeforeOuting=latestTaskState;
latestTaskState=function(t){
 const html=latestBeforeOuting(t);if(t.id!=='outing-sweet-potato')return html;
 const step=outingState().step,bill=outingBill(),decision=t.status==='wait_user'?(step===0?outingPlan():step===5?outingRestaurants():step===8?'<p class="space-caption">停车费 ¥'+bill.total+'，已领取优惠 ¥'+bill.discount+'，待您确认模拟支付 ¥'+bill.due+'。也可自行支付。</p>':''):'';
 const link=decision+'<div class="outing-detail-link"><button class="secondary wide" onclick="'+(t.status==='done'?'jumpToOutingMemory()':'closeModal();startOutingStory()')+'">'+(t.status==='done'?'查看个人空间里的留痕 →':'回到会话，继续这一天 →')+'</button></div>';
 return html.replace('</div></details>',link+'</div></details>');
};
render();
