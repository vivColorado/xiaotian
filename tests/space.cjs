/* Shared record integrity, itinerary transitions and three-page navigation. */
const assert=require('assert');
const {environment}=require('./environment.cjs');
let env=environment(),{run,node,c}=env;
assert.equal(run('ps().records.filter(r=>r.kind==="milestone").length'),8);
assert.equal(run('ps().records.filter(r=>r.kind==="life").length'),5);
assert.equal(run('spaceRecord("milestone-6").date'),'2025-01-23');
assert.equal(run('spaceRecord("milestone-5").date'),'2024-12-10');
assert.equal(run('spaceAge()'),'2 岁 8 个月');
assert.equal(run('now().toISOString().slice(0,10)'),'2026-10-15');
assert(run('home()').includes('完整回放'));
// All three pages are reachable through the dock and horizontal gestures.
run("pageDockAction()");assert.equal(run('pageDockOpen'),true);
for(const name of ['吩咐我','工作台','个人空间'])assert(node('floating').innerHTML.includes(name));
run("go('overview')");assert.equal(run('pageDockOpen'),false);node('main').scrollTop=223;
run("go('space')");assert(node('main').innerHTML.includes('日子慢慢过'));assert(node('main').innerHTML.includes('今天'));
assert.equal(node('brandname').textContent,'小天 · 个人空间');assert(node('page-position').innerHTML.includes('3 / 3'));
node('main').scrollTop=305;run("go('overview')");assert.equal(node('main').scrollTop,223);run("go('space')");assert.equal(node('main').scrollTop,305);
run("S.dictationText='这句还没说完';startDictation();go('overview')");assert.equal(run('listening'),true);assert(run('S.dictationText').includes('这句还没说完'));run('stopDictation()');
assert.equal(run("adjacentPage('home',-90)"),'overview');assert.equal(run("adjacentPage('overview',-90)"),'space');assert.equal(run("adjacentPage('space',90)"),'overview');assert.equal(run("adjacentPage('space',-90)"),null);assert.equal(run("adjacentPage('home',90)"),null);
const top=node('top'),touch=(x,y)=>({clientX:x,clientY:y}),target={closest(){return null}};
function fire(name,e,t=target){top.events[name].forEach(f=>f({...e,target:t,cancelable:true,preventDefault(){}}));}
run("go('overview')");fire('touchstart',{touches:[touch(300,100)]});fire('touchmove',{touches:[touch(170,102)]});fire('touchend',{changedTouches:[touch(160,102)]});assert.equal(run('S.page'),'space');
fire('touchstart',{touches:[touch(120,100)]});fire('touchmove',{touches:[touch(250,102)]});fire('touchend',{changedTouches:[touch(260,102)]});assert.equal(run('S.page'),'overview');
const protectedTarget={closest(){return {}}};fire('touchstart',{touches:[touch(300,100)]},protectedTarget);fire('touchend',{changedTouches:[touch(100,100)]},protectedTarget);assert.equal(run('S.page'),'overview');
// All space views render; missing dates have an empty state and can be backfilled.
for(const tab of ['overview','self','life','child']){run("go('space');setSpaceTab('"+tab+"')");assert(node('main').innerHTML.includes('personal-space'));}
run("setSpaceTab('overview');selectSpaceDay('2026-02-20')");assert(node('main').innerHTML.includes('这天还没有记录'));
run("selectSpaceDay('2026-10-15')");assert(node('main').innerHTML.includes('查看全部 4 条'));run('showSpaceDayRecords()');assert(node('modal').innerHTML.includes('个人 AI 助理的记忆机制'));
run('openSpaceCalendar()');assert(node('modal').innerHTML.includes('2026 年 10 月'));run('shiftSpaceMonth(-1)');assert.equal(run('ps().calendarMonth'),'2026-09');
// Configured apps really create forms and keep valid numeric records across reload.
node('space-app-name').value='散步时光';node('space-app-type').value='number';node('space-app-section').value='life';node('space-app-unit').value='分钟';
run('createPersonalApp()');const appId=run('ps().apps.at(-1).id');assert.equal(run('ps().apps.at(-1).section'),'life');assert(node('modal').innerHTML.includes('散步时光'));
const fields={'space-record-date':'2026-10-15','space-record-time':'18:20','space-record-title':'公园散步','space-record-note':'今天风很温柔','space-record-value-0':'35'};
Object.entries(fields).forEach(([id,v])=>node(id).value=v);
assert.equal(run("saveSpaceRecord('','"+appId+"')"),true);
const recordId=run('ps().records.at(-1).id');assert.equal(run('spaceRecords("'+appId+'")[0].values[0]'),35);
run("setSpaceTab('life')");assert(node('main').innerHTML.includes('散步时光'));
node('space-record-value-0').value='';assert.equal(run("saveSpaceRecord('','"+appId+"')"),false);
node('space-record-value-0').value='40';node('space-record-date').value='2026-02-30';assert.equal(run("saveSpaceRecord('','"+appId+"')"),false);
node('space-record-date').value='2026-10-15';node('space-record-title').value='<img src=x onerror=alert(1)>';
assert.equal(run("saveSpaceRecord('"+recordId+"','"+appId+"')"),true);run("openSpaceRecord('"+recordId+"')");assert(node('modal').innerHTML.includes('&lt;img'));assert(!node('modal').innerHTML.includes('<img src=x'));
run("toggleSpaceApp('"+appId+"')");assert.equal(run('spaceApp("'+appId+'").archived'),true);assert(run('spaceRecord("'+recordId+'")'));
run("buildSpaceApp()");assert(node('modal').innerHTML.includes('恢复 散步时光'));run("toggleSpaceApp('"+appId+"')");
env=environment(env.saved);({run,node,c}=env);assert.equal(run('spaceRecord("'+recordId+'").values[0]'),40);
// A single outing task advances through static receipts; repeated clicks do not duplicate.
run('startOutingStory()');assert.equal(run('outingState().step'),0);
assert.equal(run('item("outing-sweet-potato").status'),'wait_user');
const first=run('JSON.stringify(S.messages.find(m=>m.kind==="outing_scene"))'),before=run('S.messages.length');
run('advanceOuting(0);advanceOuting(0)');assert.equal(run('outingState().step'),1);assert.equal(run('S.messages.length'),before+1);
run('advanceOuting(1);togglePacked(0);togglePacked(2)');assert.equal(run('outingState().packed.length'),2);assert(node('outing-packed-count').textContent.includes('2/8'));
run('advanceOuting(2);advanceOuting(3)');assert(run('conversationMessage(S.messages.at(-1),0)').includes('非真实照片'));
run('advanceOuting(4)');assert(run('conversationMessage(S.messages.at(-1),0)').includes('田园家常菜'));assert.equal(run('item("outing-sweet-potato").status'),'wait_user');
run('showOutingRestaurant(0)');assert(node('modal').innerHTML.includes('模拟预约并导航'));
run('advanceOuting(5);advanceOuting(6);claimOutingCoupon();advanceOuting(7)');
assert.equal(run('S.messages.at(-1).bill.due'),6);assert.equal(run('outingState().payment'),'pending');
assert.equal(run('spaceRecord("outing-memory")'),undefined);
// Queries and other explicit task contexts do not accidentally pay or advance the outing.
run("processInput('全部任务怎么样？')");assert.equal(run('outingState().step'),8);assert.equal(run('S.messages.at(-1).kind'),'task_digest');
run("processInput('请把牛奶的清单发到我的邮箱','case_login')");assert.equal(run('outingState().step'),8);
run('advanceOuting(8);advanceOuting(9)');assert.equal(run('outingState().step'),10);assert.equal(run('item("outing-sweet-potato").status'),'done');
assert.equal(run('JSON.stringify(S.messages.find(m=>m.kind==="outing_scene"))'),first);
assert.equal(run('ps().records.filter(r=>r.outing).length'),2);assert.equal(run('new Set(ps().records.filter(r=>r.outing).map(r=>r.sourceTask)).size'),1);
const doneCount=run('S.messages.length');run('replayOutingStory();saveOutingMemories()');assert.equal(run('S.messages.length'),doneCount);assert.equal(run('ps().records.filter(r=>r.outing).length'),2);
run('jumpToOutingMemory()');assert.equal(run('S.page'),'space');assert.equal(run('ps().tab'),'life');assert(node('modal').innerHTML.includes('回看这一天的会话'));
run('returnToOuting()');assert.equal(run('S.page'),'home');
run('detail("outing-sweet-potato")');assert(node('modal').innerHTML.includes('查看个人空间里的留痕'));
// Without claiming the coupon the bill is not silently discounted; self-pay stays separate.
env=environment();({run,node,c}=env);run('startOutingStory()');for(let step=0;step<8;step++)run('advanceOuting('+step+')');
assert.equal(run('S.messages.at(-1).bill.due'),18);run("advanceOuting(8,'self')");assert.equal(run('outingState().payment'),'self');assert(run('conversationMessage(S.messages.at(-1),0)').includes('您选择自行支付'));
run('advanceOuting(9)');const persisted=env.saved;env=environment(persisted);({run,node,c}=env);assert.equal(run('outingState().step'),10);assert.equal(run('ps().records.filter(r=>r.outing).length'),2);
run('confirmDeleteSpaceRecord("outing-first")');assert.equal(run('spaceRecord("outing-first")'),undefined);assert(run('spaceRecord("outing-memory")'));
env=environment();({run,node,c}=env);run('simulateGlucoseSync();simulateGlucoseSync()');assert.equal(run('ps().records.filter(r=>r.id==="glucose-device-demo").length'),1);assert.equal(run('spaceRecord("glucose-device-demo").sample'),true);
run('startOutingStory();pause("outing-sweet-potato");advanceOuting(0)');assert.equal(run('outingState().step'),0);assert.equal(run('item("outing-sweet-potato").status'),'paused');run('resume("outing-sweet-potato");advanceOuting(0)');assert.equal(run('outingState().step'),1);
console.log('PASS: three-page dock/swipes/scroll/voice; dated space views; real app creation and validated record editing/persistence; static outing receipts; packing/coupon/payment boundaries; linked memories and idempotent replay.');
