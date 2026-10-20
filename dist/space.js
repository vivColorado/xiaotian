/* Personal space: dated records, lightweight configurable apps and shared memories. */
I.pin='M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0';
I.heart='M20 5c-3-3-7-1-8 2-1-3-5-5-8-2-5 5 8 15 8 15S25 10 20 5Z';
I.book='M3 4h6l3 2 3-2h6v15h-6l-3 2-3-2H3zM12 6v15';
I.sun='M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0';
const SPACE_APPS=[
 {id:'glucose',title:'血糖手账',icon:'heart',desc:'一次测量，一点了解',unit:'mmol/L',fields:['血糖'],section:'self'},
 {id:'weight',title:'轻盈计划',icon:'leaf',desc:'看见缓慢的改变',unit:'kg',fields:['体重'],section:'self'},
 {id:'reading',title:'阅读与追踪',icon:'book',desc:'把好奇变成积累',fields:[],section:'self'},
 {id:'growth',title:'小包成长',icon:'person',desc:'每一厘米都值得记住',unit:'cm / kg',fields:['身高（cm）','体重（kg）'],section:'child'},
 {id:'feeding',title:'喂养日志',icon:'clock',desc:'珍藏新生儿的日常',unit:'mL',fields:['奶量'],section:'child'},
 {id:'observation',title:'照护观察',icon:'heart',desc:'按时间记下变化',fields:[],section:'child'}
];
const CHILD_MOMENTS=[
 ['2024-02-02','小肉包诞生啦','从这一天起，生活多了一个小小的你。','heart'],
 ['2024-05-19','第一次外出旅游','古北水镇 · 一起看更大的世界。','pin'],
 ['2024-08-02','开荤仪式','人生的新滋味，慢慢尝。','sun'],
 ['2024-08-03','第一次逛山姆','购物车里多了一个小乘客。','pin'],
 ['2024-08-12','小包会独坐啦','复工这天，收到你的小惊喜。','person'],
 ['2024-12-10','小包到三亚咯','把冬天过成了夏天。','sun'],
 ['2025-01-23','小包能自己站起来了','摇摇晃晃，也稳稳地长大。','person'],
 ['2025-03-02','哇，小包会走啦','从第一步，走向好多好多地方。','person']
];
const LIFE_WEEKS=[
 ['2026-01-01','01','元旦打卡淄博','新年的第一站，热气腾腾。','淄博'],
 ['2026-01-10','02','南海子公园喂小鹿','周末的风，和小鹿一起记住。','南海子公园'],
 ['2026-01-17','03','说走就走，去天津喂海鸥','把普通周末，过成一次小旅行。','天津'],
 ['2026-01-24','04','这周加班，有点惨','认真生活，也包括不那么闪亮的日子。',''],
 ['2026-01-31','05','麦德龙的羊排真不错','好好吃一顿，也是生活的小成就。','麦德龙']
];
function initPersonalSpace(){
 if(S.personalSpace)return;
 const records=[
  ...CHILD_MOMENTS.map((v,i)=>({id:'milestone-'+i,kind:'milestone',section:'child',date:v[0],title:v[1],note:v[2],icon:v[3],origin:'您提供的成长故事'})),
  ...LIFE_WEEKS.map((v,i)=>({id:'week-'+i,kind:'life',section:'life',date:v[0],week:v[1],title:v[2],note:v[3],place:v[4],origin:'您提供的生活故事'})),
  ...[['2026-10-09',5.5],['2026-10-11',5.4],['2026-10-13',5.6],['2026-10-15',5.3]].map((v,i)=>({id:'glucose-'+i,app:'glucose',section:'self',date:v[0],title:'晨起测量',values:[v[1]],note:'空腹 · 手动录入',sample:true})),
  ...[['2026-09-15',68.4],['2026-09-29',68.0],['2026-10-15',67.6]].map((v,i)=>({id:'weight-'+i,app:'weight',section:'self',date:v[0],title:'体重记录',values:[v[1]],note:'晨起记录',sample:true})),
  ...[['2025-10-02',83.5,11.1],['2026-04-02',88.5,12.3],['2026-10-15',93.2,13.4]].map((v,i)=>({id:'growth-'+i,app:'growth',section:'child',date:v[0],title:'身高体重',values:v.slice(1),note:'在家测量',sample:true})),
  {id:'read-1',app:'reading',section:'self',date:'2026-10-11',title:'多模态模型：阅读笔记',note:'读完一篇论文，留下 3 个问题。',sample:true},
  {id:'read-2',app:'reading',section:'self',date:'2026-10-14',title:'具身智能 · 本周观察',note:'持续追踪：能力进展、真实场景与局限。',sample:true},
  {id:'read-3',app:'reading',section:'self',date:'2026-10-15',title:'个人 AI 助理的记忆机制',note:'读到一个想法：记忆需要可查看、可纠正。',sample:true},
  {id:'feed-1',app:'feeding',section:'child',date:'2024-02-05',time:'08:20',title:'上午喂奶',values:[60],note:'喂养后安稳入睡。',sample:true},
  {id:'observe-1',app:'observation',section:'child',date:'2024-11-08',time:'20:10',title:'不舒服时的观察',note:'记录精神、饮水和体温变化，保留给医生查看。',sample:true}
 ];
 S.personalSpace={tab:'overview',day:'2026-10-15',calendarMonth:'2026-10',apps:SPACE_APPS.map(x=>({...x})),records};
 save();
}
function ps(){initPersonalSpace();return S.personalSpace;}
function spaceRecord(id){return ps().records.find(r=>r.id===id);}
function spaceApp(id){return ps().apps.find(a=>a.id===id);}
function spaceRecords(app){return ps().records.filter(r=>!app||r.app===app).sort((a,b)=>(b.date+(b.time||'')).localeCompare(a.date+(a.time||'')));}
function spaceDate(d){return d.replaceAll('-','.');}
function spaceAge(){const birth=new Date('2024-02-02T12:00:00Z'),today=new Date(DEMO_DAY+'T12:00:00Z');let m=(today.getUTCFullYear()-birth.getUTCFullYear())*12+today.getUTCMonth()-birth.getUTCMonth();if(today.getUTCDate()<birth.getUTCDate())m--;return Math.floor(m/12)+' 岁 '+m%12+' 个月';}
function spaceSectionTitle(kicker,title,action=''){return '<div class="space-section-head"><div><span>'+kicker+'</span><h2>'+title+'</h2></div>'+action+'</div>';}
function spaceTabs(){return '<nav class="space-tabs" aria-label="个人空间分类">'+[['overview','概要'],['self','自己'],['life','生活'],['child','小包']].map(([id,label])=>'<button class="'+(ps().tab===id?'selected':'')+'" aria-pressed="'+(ps().tab===id)+'" onclick="setSpaceTab(\''+id+'\')">'+label+'</button>').join('')+'</nav>';}
function setSpaceTab(tab){if(!['overview','self','life','child'].includes(tab))return;ps().tab=tab;save();render();document.getElementById('main').scrollTop=0;}
function miniTrend(records,index=0,label='记录趋势'){
 const values=records.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(r=>Number(r.values?.[index])).filter(Number.isFinite);
 if(!values.length)return '';
 const min=Math.min(...values)-.5,max=Math.max(...values)+.5,pts=values.map((n,i)=>[10+i*240/Math.max(1,values.length-1),65-(n-min)/(max-min)*45]);
 return '<svg class="space-trend" viewBox="0 0 260 80" role="img" aria-label="'+esc(label+'：'+values.join('、'))+'"><path class="trend-base" d="M10 66H250"/><polyline points="'+pts.map(p=>p.join(',')).join(' ')+'"/>'+pts.map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3"/>').join('')+'</svg>';
}
function spaceMetric(appId){
 const app=spaceApp(appId),all=spaceRecords(appId),latest=all[0],unit=appId==='growth'?'cm':app.unit;
 return '<button class="space-metric" onclick="openSpaceApp(\''+appId+'\')"><span>'+icon(app.icon)+esc(app.title)+' <small>↗</small></span><strong>'+esc(latest?.values?.[0]??'—')+'<small>'+esc(unit)+'</small></strong>'+miniTrend(all,0,app.title)+'<footer>'+esc(latest?.date||'等待第一条记录')+'<em>'+ (latest?.sample?'示例':'手动记录')+'</em></footer></button>';
}
function spaceDevice(){
 const synced=!!spaceRecord('glucose-device-demo');
 return '<div class="space-device">'+icon('heart')+'<div><b>血糖仪监控</b><small>'+(synced?'10.15 18:45 · 已同步 1 条示例':'真实设备未连接 · 可体验同步记录')+'</small></div><button onclick="simulateGlucoseSync()">'+(synced?'已模拟同步':'体验同步')+'</button></div>';
}
function simulateGlucoseSync(){
 if(spaceRecord('glucose-device-demo')){openSpaceRecord('glucose-device-demo');return;}
 ps().records.push({id:'glucose-device-demo',app:'glucose',section:'self',date:DEMO_DAY,time:'18:45',title:'血糖仪同步',values:[5.4],note:'模拟设备读数 · 非真实测量；未连接血糖仪。',sample:true});
 save();render();toast('已模拟同步，趋势和每日小结已更新。');
}
function spaceAppGrid(section){
 const apps=ps().apps.filter(a=>!a.archived&&(!section||a.section===section));
 return '<div class="space-app-grid">'+apps.map(a=>'<button class="space-app-tile" onclick="openSpaceApp(\''+a.id+'\')"><span class="space-app-icon">'+icon(a.icon)+'</span><b>'+esc(a.title)+'</b><small>'+esc(a.desc)+'</small><em>'+spaceRecords(a.id).length+' 条记录 <span>↗</span></em></button>').join('')+'<button class="space-app-tile space-app-add" onclick="buildSpaceApp()">'+icon('plus')+'<b>按需构建</b><small>把想记录的，变成小应用</small></button></div>';
}
function spaceWeekStrip(){
 const day=ps().day,base=Date.parse(day+'T12:00Z'),dates=Array.from({length:7},(_,i)=>new Date(base+(i-3)*86400000).toISOString().slice(0,10));
 return '<div class="space-calendar-head"><button onclick="openSpaceCalendar()">'+day.slice(0,4)+' 年 '+Number(day.slice(5,7))+' 月 <span>⌄</span></button><button onclick="selectSpaceDay(\''+DEMO_DAY+'\')">回到今天</button></div><div class="space-week" data-no-page-swipe>'+dates.map(d=>{const count=ps().records.filter(r=>r.date===d).length;return '<button class="'+(d===day?'selected':'')+'" onclick="selectSpaceDay(\''+d+'\')" aria-label="'+d+(d===DEMO_DAY?' 今天':'')+'，'+count+' 条记录" aria-pressed="'+(d===day)+'"><span>'+['日','一','二','三','四','五','六'][new Date(d+'T12:00Z').getUTCDay()]+'</span><b>'+Number(d.slice(8))+'</b><i class="'+(count?'has-record':'')+'"></i>'+(d===DEMO_DAY?'<small>今天</small>':'')+'</button>';}).join('')+'</div>';
}
function selectSpaceDay(day){if(!validSpaceDate(day))return;ps().day=day;ps().calendarMonth=day.slice(0,7);save();closeModal();render();}
function validSpaceDate(d){return /^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+'T12:00Z'))&&new Date(d+'T12:00Z').toISOString().slice(0,10)===d;}
function openSpaceCalendar(){
 const month=ps().calendarMonth||ps().day.slice(0,7),first=new Date(month+'-01T12:00Z'),offset=(first.getUTCDay()+6)%7,days=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 sheet('日历 · 翻看留痕','<div class="space-month-head"><button onclick="shiftSpaceMonth(-1)" aria-label="上个月">‹</button><b>'+month.replace('-',' 年 ')+' 月</b><button onclick="shiftSpaceMonth(1)" aria-label="下个月">›</button></div><div class="space-month-grid">'+['一','二','三','四','五','六','日'].map(x=>'<span>'+x+'</span>').join('')+'<span style="grid-column:span '+offset+';'+(!offset?'display:none':'')+'"></span>'+Array.from({length:days},(_,i)=>{const d=month+'-'+String(i+1).padStart(2,'0'),n=ps().records.filter(r=>r.date===d).length;return '<button class="'+(d===ps().day?'selected':'')+'" aria-label="'+d+'，'+n+' 条记录" onclick="selectSpaceDay(\''+d+'\')">'+(i+1)+(n?'<i></i>':'')+'</button>';}).join('')+'</div><label class="space-field">直接前往某一天<input type="date" max="'+DEMO_DAY+'" value="'+ps().day+'" onchange="selectSpaceDay(this.value)"></label><p class="space-caption">有圆点的日子，留下过记录。</p>');
}
function shiftSpaceMonth(n){const d=new Date(ps().calendarMonth+'-01T12:00Z');d.setUTCMonth(d.getUTCMonth()+n);ps().calendarMonth=d.toISOString().slice(0,7);openSpaceCalendar();}
function spaceDaySummary(){
 const records=ps().records.filter(r=>r.date===ps().day),title=ps().day===DEMO_DAY?'今天，也有好好生活':ps().day==='2026-10-10'&&records.length?'把周末过成一段回忆':'这一天，值得记住';
 return '<section class="space-day-card"><div class="space-note-label">'+icon('sun')+' 每日小结 <time>'+ps().day.slice(5).replace('-',' / ')+'</time></div><h3>'+title+'</h3><p>'+(records.length?records.length+' 条留痕，关于'+[...new Set(records.map(r=>({self:'自己',life:'生活',child:'小包'})[r.section]))].join('、')+'。':'这天还没有记录。平凡的一天，也可以留下一句话。')+'</p>'+records.slice(0,3).map(r=>'<button class="space-day-row" onclick="openSpaceRecord(\''+r.id+'\')"><i></i><span>'+esc(r.title)+'</span><small>'+(r.sample?'示例':'已记录')+' ↗</small></button>').join('')+(records.length>3?'<button class="space-text-link" onclick="showSpaceDayRecords()">查看全部 '+records.length+' 条 →</button>':'')+(!records.length?'<button class="space-text-link" onclick="editSpaceRecord(\'\',\'life\')">记下这一刻 +</button>':'')+'</section>';
}
function showSpaceDayRecords(){sheet(spaceDate(ps().day)+' · 全部留痕',spaceRecordList(ps().records.filter(r=>r.date===ps().day)));}
function spaceRecordList(records){return records.length?records.map(r=>'<button class="space-record-row" onclick="openSpaceRecord(\''+r.id+'\')"><time>'+spaceDate(r.date)+(r.time?' · '+r.time:'')+'</time><b>'+esc(r.title)+'</b><p>'+esc(r.values?.length?r.values.join(' / ')+' '+(spaceApp(r.app)?.unit||''):r.note)+'</p><small>'+(r.sample?'示例记录':esc(r.origin||'您记下的'))+' <span>↗</span></small></button>').join(''):'<p class="space-empty">还没有记录。第一笔，就从今天开始。</p>';}
function spaceTimeline(records,mode='life'){
 return '<div class="space-timeline">'+records.map(r=>'<button class="space-timeline-row" onclick="openSpaceRecord(\''+r.id+'\')"><span class="space-timeline-date">'+(r.week?'<b>W'+r.week+'</b>':'<b>'+r.date.slice(5).replace('-','.')+'</b>')+'<small>'+ (r.week?r.date.slice(5).replace('-','.'):r.date.slice(0,4))+'</small></span><span class="space-timeline-body"><i>'+icon(r.icon||(mode==='child'?'heart':'leaf'))+'</i><b>'+esc(r.title)+'</b><p>'+esc(r.note)+'</p>'+(r.place?'<small>'+icon('pin')+esc(r.place)+'</small>':'')+'</span></button>').join('')+'</div>';
}
function outingCover(){return '<img class="space-outing-art" src="assets/outing-garden.svg" alt="秋日田野里的亲子挖红薯插画">';}
function spaceLifeFeature(){
 const saved=spaceRecord('outing-memory');
 return '<button class="space-feature" onclick="'+(saved?'openSpaceRecord(\'outing-memory\')':'startOutingStory()')+'">'+outingCover()+'<span class="space-feature-stamp">OCT<br><b>10</b></span><span class="space-feature-copy"><small>和小包的周末 · '+(saved?'已收藏':'待写进生活')+'</small><strong>小手挖呀挖，<br>快乐长出来了。</strong><span>'+ (saved?'第一次挖红薯 · 翻开这一天':'一起经历 → 让小天帮您安排')+'</span></span></button>';
}
function spaceOverview(){
 const moments=ps().records.filter(r=>r.kind==='milestone'),places=new Set(ps().records.map(r=>r.place).filter(Boolean));
 return '<section class="space-hero"><span class="space-eyebrow">A LITTLE MORE LIFE</span><h1>日子慢慢过，<br>美好慢慢攒。</h1><p>这里收着您的好奇、认真，和每一个小小的长大。</p><span class="space-hero-flower" aria-hidden="true">✳</span><div class="space-accumulation"><div><b>'+ps().records.length+'</b><span>份生活留痕</span></div><div><b>'+places.size+'</b><span>处一起走过</span></div><div><b>'+moments.length+'</b><span>个成长瞬间</span></div></div><small class="space-caption">含示例记录，可编辑替换成自己的生活。</small></section>'+spaceWeekStrip()+spaceDaySummary()+spaceSectionTitle('LIFE, COLLECTED','闪闪发光的生活','<button onclick="setSpaceTab(\'life\')">全部 →</button>')+spaceLifeFeature()+spaceSectionTitle('MADE FOR YOU','为您长出的小应用','<button onclick="buildSpaceApp()">＋ 构建</button>')+spaceAppGrid()+spaceSectionTitle('GROWING TOGETHER','和小包，一起长大','<button onclick="setSpaceTab(\'child\')">成长册 →</button>')+'<div class="space-child-peek"><span>小包</span><div><b>'+spaceAge()+'</b><p>从第一次见面，到每一个第一次。</p></div>'+icon('heart')+'</div>'+spaceTimeline(moments.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2),'child');
}
function spaceSelf(){
 const reads=spaceRecords('reading');
 return '<div class="space-page-intro"><span>给自己的一点时间</span><h1>照顾身体，<br>也喂养好奇心。</h1></div>'+spaceSectionTitle('CARE FOR YOURSELF','健康，慢慢记录')+'<div class="space-metrics">'+spaceMetric('glucose')+spaceMetric('weight')+'</div>'+spaceDevice()+'<p class="space-caption">健康数值为示例 · 血糖仪未连接 · 仅作记录展示</p>'+spaceSectionTitle('STAY CURIOUS','读过的，正在关注的','<button onclick="editSpaceRecord(\'\',\'reading\')">＋ 记一笔</button>')+'<div class="space-reading"><span class="space-book-mark">'+icon('book')+'</span><strong>'+reads.length+'</strong><p>篇阅读与追踪记录<br><small>让想法有迹可循</small></p></div>'+spaceRecordList(reads)+spaceSectionTitle('YOUR TOOLS','我的小应用')+spaceAppGrid('self');
}
function spaceLife(){
 const records=ps().records.filter(r=>r.kind==='life').sort((a,b)=>b.date.localeCompare(a.date)),places=[...new Set(records.map(r=>r.place).filter(Boolean))];
 return '<div class="space-page-intro"><span>生活不用每天都精彩</span><h1>但每一周，<br>都是自己的生活。</h1></div>'+spaceLifeFeature()+spaceSectionTitle('PLACES WE HAVE BEEN','足迹 · '+places.length+' 处')+'<div class="space-footprints">'+places.map((p,i)=>'<button onclick="showSpacePlace('+i+')">'+icon('pin')+esc(p)+'</button>').join('')+'</div>'+spaceSectionTitle('THE WEEKS OF 2026','这一年的生活留痕','<button onclick="editSpaceRecord(\'\',\'life\')">＋ 留下一笔</button>')+spaceTimeline(records)+(ps().apps.some(a=>!a.archived&&a.section==='life')?spaceSectionTitle('EVERYDAY TOOLS','生活小应用')+spaceAppGrid('life'):'')+'<div class="space-open-chapter"><span>W06 →</span><p>第 6 周以后的故事，<br>也可以慢慢补记。</p><button onclick="editSpaceRecord(\'\',\'life\')">补记一周 +</button></div>';
}
function showSpacePlace(i){const records=ps().records.filter(r=>r.kind==='life').sort((a,b)=>b.date.localeCompare(a.date)),places=[...new Set(records.map(r=>r.place).filter(Boolean))],p=places[i];if(p)sheet(p,spaceRecordList(records.filter(r=>r.place===p)));}
function spaceChild(){
 const moments=ps().records.filter(r=>r.kind==='milestone').sort((a,b)=>b.date.localeCompare(a.date)),growth=spaceRecords('growth'),latest=growth[0];
 return '<section class="space-child-hero"><div class="space-child-avatar">'+icon('sun')+'</div><span>小肉包的成长册</span><h1>一点一点，<br>长成自己的样子。</h1><p>2024.02.02 来到我们身边 · '+spaceAge()+'</p><div><b>'+moments.length+'</b> 个值得记住的第一次</div></section>'+spaceSectionTitle('LITTLE BY LITTLE','身高与体重','<button onclick="openSpaceApp(\'growth\')">成长记录 →</button>')+'<button class="space-growth" onclick="openSpaceApp(\'growth\')"><div><span>身高<b>'+esc(latest?.values?.[0]??'—')+' <small>cm</small></b></span><span>体重<b>'+esc(latest?.values?.[1]??'—')+' <small>kg</small></b></span></div>'+miniTrend(growth,0,'小包身高记录')+'<footer>'+esc(latest?.date||'暂无记录')+' · '+(latest?.sample?'示例测量':'手动记录')+'</footer></button>'+spaceSectionTitle('ALL YOUR FIRSTS','每一个第一次','<button onclick="editSpaceRecord(\'\',\'milestone\')">＋ 记下成长</button>')+spaceTimeline(moments,'child')+spaceSectionTitle('SMALL DAILY CARE','那些细碎的照顾')+spaceAppGrid('child')+'<p class="space-caption">喂养日志保留新生儿阶段的历史；照护观察按时间记录，不自动判断病情。</p>';
}
function personalSpace(){
 initPersonalSpace();
 const body={overview:spaceOverview,self:spaceSelf,life:spaceLife,child:spaceChild}[ps().tab]||spaceOverview;
 return '<div class="personal-space">'+spaceTabs()+body()+'<footer class="space-end">不必过得完美，值得被记住就好。<small>故事来自您的场景 · 测量与阅读为示例 · 本机保存</small><button onclick="exportPersonalSpace()">导出我的记录 ↓</button></footer></div>';
}
function openSpaceApp(id){
 const app=spaceApp(id);if(!app)return;const records=spaceRecords(id),hasSamples=records.some(r=>r.sample);
 sheet(app.title,'<div class="space-app-detail"><span class="space-app-icon">'+icon(app.icon)+'</span><p>'+esc(app.desc)+' · '+records.length+' 条记录</p>'+(hasSamples?'<p class="space-caption">内置数据为示例，可编辑或删除后录入自己的记录。</p>':'')+(app.fields.length?miniTrend(records,0,app.fields[0]):'')+'<button class="primary wide" onclick="editSpaceRecord(\'\',\''+id+'\')">＋ 添加记录</button>'+spaceRecordList(records)+'<button class="space-text-link" onclick="toggleSpaceApp(\''+id+'\')">'+(app.archived?'恢复到个人空间':'收起这个应用')+'</button></div>');
}
function toggleSpaceApp(id){const a=spaceApp(id);if(!a)return;a.archived=!a.archived;save();closeModal();render();toast(a.archived?'已收起应用，记录仍保留；可在“构建”中恢复。':'应用已恢复。');}
function buildSpaceApp(template='journal'){
 const choices={journal:['周末灵感簿','文字'],measure:['运动打卡','数值'],learning:['科技热点追踪','文字']},p=choices[template]||choices.journal;
 sheet('为您构建一个小应用','<div class="space-build"><p>从一件想持续关心的小事开始。</p><div class="space-template-choices">'+Object.entries(choices).map(([id,v])=>'<button class="'+(id===template?'selected':'')+'" onclick="buildSpaceApp(\''+id+'\')">'+v[0]+'</button>').join('')+'</div><label class="space-field">应用名称<input id="space-app-name" maxlength="20" value="'+p[0]+'"></label><label class="space-field">想怎样记录<select id="space-app-type"><option value="text" '+(p[1]==='文字'?'selected':'')+'>文字 + 日期 + 备注</option><option value="number" '+(p[1]==='数值'?'selected':'')+'>数值 + 日期 + 备注</option></select></label><label class="space-field">放在哪里<select id="space-app-section"><option value="self">自己</option><option value="life">生活</option><option value="child">小包</option></select></label><label class="space-field">数值单位（选填）<input id="space-app-unit" maxlength="12" placeholder="如 分钟、次"></label><p class="space-caption">将生成记录表单、历史列表和时间线。数值记录还会生成趋势图。</p><button class="primary wide" onclick="createPersonalApp()">构建并打开</button>'+ps().apps.filter(a=>a.archived).map(a=>'<button class="space-text-link" onclick="toggleSpaceApp(\''+a.id+'\')">恢复 '+esc(a.title)+'</button>').join('')+'</div>');
}
function createPersonalApp(){
 const title=document.getElementById('space-app-name').value.trim(),type=document.getElementById('space-app-type').value,section=document.getElementById('space-app-section').value,unit=document.getElementById('space-app-unit').value.trim();
 if(!title){toast('给这个应用起个名字吧。');return;}
 const existing=ps().apps.find(a=>a.title===title);if(existing){existing.archived=false;save();render();openSpaceApp(existing.id);return;}
 const id='personal-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);ps().apps.push({id,title:title.slice(0,20),desc:'按您的需要构建',icon:type==='number'?'leaf':'book',fields:type==='number'?['数值']:[],unit:unit.slice(0,12),section:['self','life','child'].includes(section)?section:'self',custom:true});save();render();openSpaceApp(id);
}
function editSpaceRecord(id='',target='life'){
 const r=spaceRecord(id),app=spaceApp(r?.app||target),kind=r?.kind||(!app?target:'record'),date=r?.date||ps().day;
 sheet(id?'编辑记录':'留下这一刻','<form class="space-record-form" onsubmit="event.preventDefault();saveSpaceRecord(\''+id+'\',\''+(app?.id||kind)+'\')"><label class="space-field">日期<input id="space-record-date" type="date" required max="'+DEMO_DAY+'" value="'+date+'"></label><label class="space-field">时间（选填）<input id="space-record-time" type="time" value="'+esc(r?.time||'')+'"></label><label class="space-field">这一笔叫什么<input id="space-record-title" required maxlength="60" placeholder="'+(app?esc(app.title):'今天的小小瞬间')+'" value="'+esc(r?.title||'')+'"></label>'+(app?.fields||[]).map((field,i)=>'<label class="space-field">'+esc(field)+(app.fields.length===1&&app.unit?' · '+esc(app.unit):'')+'<input id="space-record-value-'+i+'" type="number" step="any" min="0.01" max="100000" required value="'+esc(r?.values?.[i]??'')+'"></label>').join('')+(!app?'<label class="space-field">地点（选填）<input id="space-record-place" maxlength="50" value="'+esc(r?.place||'')+'"></label>':'')+'<label class="space-field">想记住的话<textarea id="space-record-note" maxlength="1000" rows="3" placeholder="一些感受、观察，或小细节…">'+esc(r?.note||'')+'</textarea></label><button type="submit" class="primary wide">保存到个人空间</button></form>');
}
function saveSpaceRecord(id,target){
 const old=spaceRecord(id),app=spaceApp(target),get=id=>document.getElementById(id)?.value||'',date=get('space-record-date'),title=get('space-record-title').trim(),values=(app?.fields||[]).map((_,i)=>Number(get('space-record-value-'+i)));
 if(!validSpaceDate(date)||date>DEMO_DAY){toast('请填写有效日期，最晚为演示今天 10.15。');return false;}
 if(!title||values.some(n=>!Number.isFinite(n)||n<=0||n>100000)){toast('请补全标题和有效的记录数值。');return false;}
 const r={...old,id:old?.id||'record-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),app:app?.id,kind:app?'record':target,section:app?.section||(target==='milestone'?'child':'life'),date,time:get('space-record-time'),title:title.slice(0,60),note:get('space-record-note').slice(0,1000),values,place:app?old?.place:get('space-record-place').slice(0,50),sample:false,origin:'您记下的'};
 if(old)Object.assign(old,r);else ps().records.push(r);ps().day=date;save();closeModal();render();toast('已收好，时间线上又多了一笔。');return true;
}
function openSpaceRecord(id){
 const r=spaceRecord(id);if(!r)return;
 sheet(r.title,'<article class="space-record-detail"><span class="space-eyebrow">'+spaceDate(r.date)+(r.time?' · '+r.time:'')+'</span>'+(r.outing?outingCover():'')+'<h2>'+esc(r.title)+'</h2><p>'+esc(r.note)+'</p>'+(r.values?.length?'<div class="space-record-value">'+esc(r.values.join(' / '))+' <small>'+esc(spaceApp(r.app)?.unit||'')+'</small></div>':'')+(r.place?'<p class="space-caption">'+icon('pin')+esc(r.place)+'</p>':'')+(r.outing?'<div class="space-memory-links"><span>已同步留痕</span><b>生活状态 · 出行足迹 · 小包第一次</b></div><button class="primary wide" onclick="returnToOuting()">回看这一天的会话 →</button>':'')+'<p class="space-caption">'+esc(r.sample?'示例记录，非真实测量':r.origin||'您记下的')+'</p><div class="space-record-actions"><button onclick="editSpaceRecord(\''+id+'\',\''+(r.app||r.kind)+'\')">编辑</button><button onclick="deleteSpaceRecord(\''+id+'\')">删除</button></div></article>');
}
function deleteSpaceRecord(id){
 const r=spaceRecord(id);if(!r)return;
 sheet('删除这条记录？','<p>'+esc(r.title)+'</p><p class="space-caption">只删除当前这条，其他成长、足迹与会话记录仍保留。</p><button class="primary wide" onclick="confirmDeleteSpaceRecord(\''+id+'\')">确认删除</button>');
}
function confirmDeleteSpaceRecord(id){ps().records=ps().records.filter(r=>r.id!==id);save();closeModal();render();toast('这条记录已删除。');}
function exportPersonalSpace(){
 const blob=new Blob([JSON.stringify({product:'小天',exportedAt:now().toISOString(),personalSpace:ps()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='xiaotian-personal-space-2026-10-15.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
initPersonalSpace();
render();


/* v35: knowledge base, personal dashboards and on-demand apps. */
const __legacyInitPersonalSpaceV34 = initPersonalSpace;
const V35_KB_SEED = [
 {id:'kb-1',type:'link',title:'个人 AI 助理的记忆机制',meta:'文章 · 2026-10-15',tags:['个人助理','记忆'],desc:'记忆需要可查看、可纠正，并能回到具体事项。'},
 {id:'kb-2',type:'doc',title:'周末天津亲子出行攻略',meta:'文档 · 2026-10-10',tags:['出行','小包'],desc:'路线、停车、喂海鸥和返程安排已整理成一页。'},
 {id:'kb-3',type:'ai',title:'婚礼筹备预算草案',meta:'AI 产出 · 2026-10-12',tags:['婚礼','项目'],desc:'场地、摄影、礼服、宾客与预算的第一版拆解。'},
 {id:'kb-4',type:'link',title:'具身智能 · 本周观察',meta:'链接 · 2026-10-14',tags:['学习','科技'],desc:'持续追踪能力进展、真实场景与局限。'}
];
const V35_APPS_SEED = [
 {id:'wedding',title:'婚礼筹备',icon:'heart',desc:'把重要的一天，拆成可推进的计划。',status:'规划中',progress:42,budget:'¥86,000',items:['确定婚礼场地','整理宾客名单','比较摄影摄像方案']},
 {id:'travel',title:'亲子出行',icon:'pin',desc:'行程、资料、预算和沿途记录放在一起。',status:'准备中',progress:68,budget:'¥3,200',items:['确认天津往返路线','准备儿童零食和水','整理沿途照片']}
];
function initPersonalSpace(){
 __legacyInitPersonalSpaceV34();
 const p=S.personalSpace||{};
 if(!p.v35){
  p.v35={kb:V35_KB_SEED.map(function(x){return Object.assign({},x,{tags:x.tags.slice()});}),kbFilter:'全部',kbQuery:'',dashFilter:'all',apps:V35_APPS_SEED.map(function(x){return Object.assign({},x,{items:x.items.slice()});})};
 }else{
  p.v35.kb=p.v35.kb||V35_KB_SEED.map(function(x){return Object.assign({},x,{tags:x.tags.slice()});});
  p.v35.apps=p.v35.apps||V35_APPS_SEED.map(function(x){return Object.assign({},x,{items:x.items.slice()});});
  p.v35.kbFilter=p.v35.kbFilter||'全部'; p.v35.kbQuery=p.v35.kbQuery||''; p.v35.dashFilter=p.v35.dashFilter||'all';
 }
 if(!['overview','knowledge','dashboard','apps'].includes(p.tab))p.tab='overview';
 save();
}
function setSpaceTab(tab){
 if(!['overview','knowledge','dashboard','apps'].includes(tab))return;
 ps().tab=tab;save();render();
 var main=document.getElementById('main');if(main)main.scrollTop=0;
}
function v35TabButton(id,label,iconName){
 return '<button class="space-v35-tab '+(ps().tab===id?'selected':'')+'" aria-pressed="'+(ps().tab===id)+'" onclick="setSpaceTab(\''+id+'\')">'+icon(iconName)+ '<span>'+label+'</span></button>';
}
function spaceTabs(){
 return '<nav class="space-v35-tabs" aria-label="个人空间分类">'+v35TabButton('overview','总览','sun')+v35TabButton('knowledge','知识库','book')+v35TabButton('dashboard','个人看板','leaf')+v35TabButton('apps','个性化应用','plus')+'</nav>';
}
function v35Section(kicker,title,action){
 return '<div class="space-v35-section-head"><div><span>'+kicker+'</span><h2>'+title+'</h2></div>'+(action||'')+'</div>';
}
function v35TypeLabel(type){return type==='link'?'链接':type==='doc'?'文档':'AI 产出';}
function v35KnowledgeCards(){
 var p=ps().v35,q=(p.kbQuery||'').trim().toLowerCase(),f=p.kbFilter||'全部';
 var rows=p.kb.filter(function(x){return (f==='全部'||v35TypeLabel(x.type)===f||x.tags.includes(f))&&(!q||(x.title+' '+x.desc+' '+x.tags.join(' ')).toLowerCase().includes(q));});
 if(!rows.length)return '<div class="space-v35-empty">还没有匹配内容，换个关键词试试。</div>';
 return '<div class="space-v35-kb-grid">'+rows.map(function(x){return '<button class="space-v35-kb-card" onclick="openKnowledgeItemV35(\''+x.id+'\')"><div class="space-v35-kb-top"><span class="space-v35-type '+x.type+'">'+v35TypeLabel(x.type)+'</span><small>'+esc(x.meta)+'</small></div><h3>'+esc(x.title)+'</h3><p>'+esc(x.desc)+'</p><div class="space-v35-tags">'+x.tags.map(function(t){return '<em>'+esc(t)+'</em>';}).join('')+'</div><span class="space-v35-card-link">查看内容 ↗</span></button>';}).join('')+'</div>';
}
function spaceKnowledgeV35(){
 var p=ps().v35;
 return '<div class="space-v35-intro"><span>YOUR SECOND BRAIN</span><h1>发过的内容，<br>都能找到。</h1><p>链接、文档和 AI 产出会自动归到主题、项目和任务里。</p></div>'+v35Section('COLLECTED FOR YOU','个人知识库','<button class="space-v35-action" onclick="addKnowledgeItemV35()">＋ 收进来</button>')+'<div class="space-v35-search"><span>⌕</span><input value="'+esc(p.kbQuery||'')+'" placeholder="搜索标题、主题或任务" oninput="updateSpaceKBQuery(this.value)"></div><div class="space-v35-filters">'+['全部','链接','文档','AI 产出','个人助理','出行','项目','学习'].map(function(f){return '<button class="'+(p.kbFilter===f?'selected':'')+'" onclick="setSpaceKBFilter(\''+f+'\')">'+f+'</button>';}).join('')+'</div>'+v35KnowledgeCards()+'<p class="space-v35-caption">示例资料可公开展示，也可以替换成自己的链接和文件。</p>';
}
function updateSpaceKBQuery(v){ps().v35.kbQuery=v;save();render();}
function setSpaceKBFilter(v){ps().v35.kbFilter=v;save();render();}
function openKnowledgeItemV35(id){
 var x=ps().v35.kb.find(function(v){return v.id===id});if(!x)return;
 sheet(x.title,'<div class="space-v35-kb-detail"><div class="space-v35-type '+x.type+'">'+v35TypeLabel(x.type)+'</div><p>'+esc(x.desc)+'</p><div class="space-v35-detail-meta">'+x.tags.map(function(t){return '<span>'+esc(t)+'</span>';}).join('')+'</div><button class="primary wide" onclick="closeModal();setSpaceTab(\'knowledge\')">回到知识库</button></div>');
}
function addKnowledgeItemV35(){
 var title=window.prompt('记一条知识库内容的标题','今天的新想法');if(!title)return;
 ps().v35.kb.unshift({id:'kb-'+Date.now(),type:'ai',title:title,meta:'刚刚收进来',tags:['随手记'],desc:'由你刚刚补充，之后可以继续归到主题、项目或任务。'});save();render();toast('已收进个人知识库。');
}
function v35MetricCard(id,title,value,unit,desc){
 return '<button class="space-v35-metric" onclick="openSpaceApp(\''+id+'\')"><div><span>'+esc(title)+'</span><small>进入应用 ↗</small></div><strong>'+esc(String(value))+'<em>'+esc(unit||'')+'</em></strong><p>'+esc(desc)+'</p></button>';
}
function spaceDashboardV35(){
 var glucose=spaceRecords('glucose'),weight=spaceRecords('weight'),growth=spaceRecords('growth'),reads=spaceRecords('reading'),places=[].concat(new Set(ps().records.map(function(r){return r.place;}).filter(Boolean)));
 var lg=glucose[0],lw=weight[0],gh=growth[0];
 return '<div class="space-v35-intro"><span>YOUR LIFE, IN VIEW</span><h1>把随口记录的，<br>变成看得见的变化。</h1><p>体重、血糖、足迹和灵光一现，都可以长成自己的图表和应用。</p></div>'+v35Section('PERSONAL SIGNALS','我的看板','<button class="space-v35-action" onclick="quickNoteV35()">＋ 随口记</button>')+'<div class="space-v35-metrics">'+v35MetricCard('weight','体重',lw&&lw.values?lw.values[0]:'—','kg','看见缓慢的改变')+v35MetricCard('glucose','血糖',lg&&lg.values?lg.values[0]:'—','mmol/L','记录每一次测量')+v35MetricCard('growth','小包身高',gh&&gh.values?gh.values[0]:'—','cm','每一厘米都值得记住')+'</div><div class="space-v35-chart-row"><button class="space-v35-chart" onclick="setSpaceTab(\'life\')"><div><span>生活足迹</span><strong>'+places.length+' 处</strong></div><div class="space-v35-bars">'+[42,68,54,82,63,91].map(function(n){return '<i style="height:'+n+'%"></i>';}).join('')+'</div><small>点击回到生活留痕 ↗</small></button><button class="space-v35-chart" onclick="openSpaceApp(\'reading\')"><div><span>学习与追踪</span><strong>'+reads.length+' 条</strong></div><p>论文、科技新闻和自己的问题，会慢慢连成一条线。</p><small>打开阅读应用 ↗</small></button></div><p class="space-v35-caption">看板中的数值是可编辑的示例记录，点击卡片进入对应应用。</p>';
}
function quickNoteV35(){
 var kind=window.prompt('想记什么？输入“体重 67.2”或“灵光：...”','灵光：记忆应该可查看、可纠正');if(!kind)return;
 var m=kind.match(/体重\\s*([0-9.]+)/);if(m)ps().records.push({id:'weight-'+Date.now(),app:'weight',section:'self',date:DEMO_DAY,title:'随口记录体重',values:[Number(m[1])],note:'来自个人看板随口记',sample:false});
 else ps().v35.kb.unshift({id:'kb-'+Date.now(),type:'ai',title:kind.replace(/^灵光[:：]?\\s*/,''),meta:'灵光随记 · '+DEMO_DAY,tags:['灵光','随手记'],desc:'刚刚记下的想法，之后可归入项目或任务。'});
 save();render();toast('已更新个人看板。');
}
function v35AppCard(a){
 return '<button class="space-v35-app-card" onclick="openCustomAppV35(\''+a.id+'\')"><span class="space-v35-app-icon">'+icon(a.icon)+'</span><div><h3>'+esc(a.title)+'</h3><p>'+esc(a.desc)+'</p><div class="space-v35-progress"><i style="width:'+a.progress+'%"></i></div><small>'+a.status+' · 已完成 '+a.progress+'%</small></div><b>↗</b></button>';
}
function spaceAppsV35(){
 var apps=ps().v35.apps;
 return '<div class="space-v35-intro"><span>BUILT AROUND YOUR LIFE</span><h1>需要什么，<br>就长出什么。</h1><p>婚礼、出行、学习或一个临时项目，都可以成为一套专属的小应用。</p></div>'+v35Section('ON DEMAND','个性化应用','<button class="space-v35-action" onclick="buildCustomAppV35()">＋ 新建应用</button>')+'<div class="space-v35-app-list">'+apps.map(v35AppCard).join('')+'</div><div class="space-v35-create-card"><span>'+icon('plus')+'</span><div><b>按需构建自己的应用</b><p>告诉小天你要管理什么，它会帮你搭好清单、资料、预算和进度。</p></div><button onclick="buildCustomAppV35()">开始构建</button></div>';
}
function openCustomAppV35(id){
 var a=ps().v35.apps.find(function(x){return x.id===id});if(!a)return;
 var body='<div class="space-v35-app-detail"><div class="space-v35-app-detail-head"><span class="space-v35-app-icon">'+icon(a.icon)+'</span><div><h3>'+esc(a.title)+'</h3><p>'+esc(a.desc)+'</p></div></div><div class="space-v35-detail-stats"><span>进度 <b>'+a.progress+'%</b></span><span>预算 <b>'+esc(a.budget)+'</b></span></div><div class="space-v35-checklist">'+a.items.map(function(x,i){return '<label><input type="checkbox" '+(i<a.progress/30?'checked':'')+' onchange="toggleCustomItemV35(\''+a.id+'\','+i+',this.checked)"><span>'+esc(x)+'</span></label>';}).join('')+'</div><button class="primary wide" onclick="addCustomItemV35(\''+a.id+'\')">＋ 添加一项</button></div>';
 sheet(a.title,body);
}
function toggleCustomItemV35(id,i,checked){var a=ps().v35.apps.find(function(x){return x.id===id});if(!a)return;a.progress=Math.max(0,Math.min(100,a.progress+(checked?8:-8)));save();}
function addCustomItemV35(id){var a=ps().v35.apps.find(function(x){return x.id===id});if(!a)return;var v=window.prompt('添加到'+a.title,'补充一项');if(!v)return;a.items.push(v);save();openCustomAppV35(id);toast('已添加到'+a.title+'。');}
function buildCustomAppV35(){var title=window.prompt('想构建什么应用？','家庭年度旅行');if(!title)return;ps().v35.apps.push({id:'app-'+Date.now(),title:title,icon:'pin',desc:'为你定制的生活项目应用。',status:'刚刚创建',progress:0,budget:'待补充',items:['明确目标','收集资料','安排下一步']});save();render();toast('已创建个性化应用。');}
function spaceOverview(){
 var p=ps().v35,records=ps().records,places=[].concat(new Set(records.map(function(r){return r.place;}).filter(Boolean)));
 return '<div class="space-v35-hero"><div><span>PERSONAL SPACE · v35</span><h1>把生活交给自己，<br>把琐碎交给小天。</h1><p>知识有地方放，变化有地方看，需要什么就按需长出一个应用。</p></div><div class="space-v35-hero-orb">✳</div></div><div class="space-v35-overview-grid"><button onclick="setSpaceTab(\'knowledge\')"><span>'+icon('book')+'</span><b>个人知识库</b><p>链接、文档和 AI 产出，自动归到主题、项目和任务。</p><small>'+p.kb.length+' 条内容 · 进入查看 ↗</small></button><button onclick="setSpaceTab(\'dashboard\')"><span>'+icon('leaf')+'</span><b>个人看板</b><p>体重、血糖、足迹和灵光，点击图表进入个性化应用。</p><small>'+records.length+' 条记录 · 进入查看 ↗</small></button><button onclick="setSpaceTab(\'apps\')"><span>'+icon('plus')+'</span><b>个性化应用</b><p>婚礼、出行和临时项目，清单、资料、预算、进度放在一起。</p><small>'+p.apps.length+' 个应用 · 进入查看 ↗</small></button></div>'+v35Section('A LIFE THAT ADDS UP','最近发生的事','<button class="space-v35-action" onclick="setSpaceTab(\'dashboard\')">打开看板 →</button>')+'<div class="space-v35-recent">'+records.slice().sort(function(a,b){return (b.date+(b.time||'')).localeCompare(a.date+(a.time||''));}).slice(0,4).map(function(r){return '<button onclick="openSpaceRecord(\''+r.id+'\')"><time>'+spaceDate(r.date)+(r.time?' · '+r.time:'')+'</time><b>'+esc(r.title)+'</b><small>'+esc(r.note||'示例记录')+'</small></button>';}).join('')+'</div><p class="space-v35-caption">当前展示为公开示例数据，可以编辑、补记或替换。</p>';
}
function personalSpace(){
 initPersonalSpace();
 var body={overview:spaceOverview,knowledge:spaceKnowledgeV35,dashboard:spaceDashboardV35,apps:spaceAppsV35}[ps().tab]||spaceOverview;
 return '<div class="personal-space personal-space-v35">'+spaceTabs()+body()+'</div>';
}
