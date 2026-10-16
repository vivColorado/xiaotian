/* Deterministic interaction regressions; DOM geometry is mocked, not browser QA. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const nodes=new Map();
function node(id){
 if(!nodes.has(id))nodes.set(id,{innerHTML:'',value:'',dataset:{},style:{setProperty(){}},scrollTop:0,scrollHeight:2400,clientHeight:600,clientWidth:390,offsetHeight:0,events:{},addEventListener(k,f){(this.events[k]??=[]).push(f)},setAttribute(k,v){this[k]=v},focus(){},querySelector(){return null},querySelectorAll(){return []},getBoundingClientRect(){return {top:0,left:0,height:800,width:390}},insertAdjacentHTML(where,html){this.innerHTML+=html}});
 return nodes.get(id);
}
const timers=new Map();let timerId=0;
const c={console,Date,Math,JSON,Map,Set,Blob,URL,structuredClone,localStorage:{getItem(){return null},setItem(){}},window:{},navigator:{},document:{getElementById:node,querySelector:s=>s==='.app'?node('app'):s==='.top'?node('top'):null,querySelectorAll(){return []},addEventListener(){},documentElement:node('root'),createElement:()=>node('tmp')},setTimeout:(f,d)=>{timers.set(++timerId,{f,d});return timerId},clearTimeout:id=>timers.delete(id),setInterval:(f,d)=>{timers.set(++timerId,{f,d});return timerId},clearInterval:id=>timers.delete(id),cancelAnimationFrame(){},requestAnimationFrame:()=>0};
vm.createContext(c);
for(const file of ['seed','app','overview','workbench','calendar','story','floating','conversation'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/'+file+'.js'),'utf8'),c,{filename:file+'.js'});
const run=s=>vm.runInContext(s,c),main=node('main');
run("go('home')");
let html=main.innerHTML;
assert(html.includes('有什么事，直接吩咐我就好。'));
assert(!html.includes('quick-examples'));
assert.equal(node('footer').innerHTML,'');
assert(node('floating').innerHTML.includes('打开文字输入'));
for(const state of ['created','assist','done'])assert.equal((html.match(new RegExp('data-story-state="'+state+'"','g'))||[]).length,1);
assert(html.indexOf('shopping-created')<html.indexOf('shopping-help'));
assert(html.indexOf('shopping-help')<html.indexOf('shopping-done'));
const storyBefore=run('conversationStory()');run("item('shop').status='paused'");assert.equal(run('conversationStory()'),storyBefore);
run("item('shop').status='done'");
// A supplement stays with its explicitly selected task despite other task keywords.
run("supplementTask('case_login');editDictation('请把牛奶的清单发到我的邮箱')");
assert(node('footer').innerHTML.includes('补充 · 会议纪要'));
assert.equal(run("processInput('请把牛奶的清单发到我的邮箱',inputContext)[0]"),'case_login');
run('startDictation()');assert.equal(run('inputContext'),'case_login');run('stopDictation()');
// Multiline input requires explicit send; empty sends and IME composition are guarded.
run("clearComposerContext();editDictation('');drawComposer()");
assert(node('footer').innerHTML.includes('event.ctrlKey||event.metaKey'));
assert(node('footer').innerHTML.includes('!event.isComposing'));
const beforeEmpty=run('S.messages.length');node('input').value='';run('sendInput()');assert.equal(run('S.messages.length'),beforeEmpty);
run("editDictation('帮我整理旅行清单；请写一封邀请函')");node('input').value=run('S.dictationText');run('sendInput()');
assert.equal(run('S.messages.at(-1).cards.length'),2);
assert.equal(run('voiceContext'),'');assert.equal(run('inputContext'),'');assert.equal(node('footer').innerHTML,'');
const batch=run('S.messages.at(-1)'),snap=JSON.stringify(batch.cards);
run("entity(S.messages.at(-1).cards[0].id).status='done'");assert.equal(JSON.stringify(batch.cards),snap);
assert(run('home()').includes('这次的安排'));
assert(!run('S.messages.at(-1).conversationHistory'));
// Two updates to identical task IDs must have independent collapse/scroll state.
assert(run("batchCards(S.messages.at(-1).cards,'first')").includes('data-batch="first" open'));
assert(run("batchCards(S.messages.at(-1).cards,'second')").includes('data-batch="second" open'));
const foldA={dataset:{batch:'first'},open:false,querySelector(){return this.grid},grid:{scrollTop:77}};
const foldB={dataset:{batch:'second'},open:true,querySelector(){return this.grid},grid:{scrollTop:145}};
main.querySelectorAll=s=>s==='.batch-bundle'?[foldA,foldB]:[];
main.scrollTop=460;run('captureConversationView()');foldA.open=true;foldB.open=false;foldA.grid.scrollTop=0;foldB.grid.scrollTop=0;run('restoreConversationView()');
assert.equal(foldA.open,false);assert.equal(foldB.open,true);assert.equal(foldA.grid.scrollTop,77);assert.equal(foldB.grid.scrollTop,145);
// New results leave an older reading position intact and expose a jump affordance.
run("chatView.unread=0;chatView.knownCount=S.messages.filter(m=>!m.supersededShoppingExample).length");
main.scrollTop=460;run("S.messages.push({kind:'direct',text:'有新进展',at:now().toISOString()});render()");
assert.equal(main.scrollTop,460);assert.equal(run('chatView.unread'),1);assert.equal(node('chat-latest').hidden,false);
run("go('overview');go('home')");assert.equal(main.scrollTop,460);
run('jumpConversationLatest()');assert.equal(run('chatView.unread'),0);assert.equal(node('chat-latest').hidden,true);
// When already at the end, new results follow; collapsing the input preserves its text.
main.scrollTop=1800;run("S.messages.push({kind:'direct',text:'另一个结果'});render()");assert.equal(main.scrollTop,2400);
run("openTextComposer('先记一下');hideComposer()");assert.equal(run('S.dictationText'),'先记一下');assert(node('floating').innerHTML.includes('继续编辑'));
// Saving a draft keeps task context, creates no execution and clears next-input context.
run("inputContext='case_login';voiceContext='case_login';openTextComposer('登录后继续')");node('input').value=run('S.dictationText');const beforeDraft=run('S.messages.length');run('storeInlineDraft()');
assert.equal(run('S.messages.length'),beforeDraft);assert.equal(run('S.drafts.at(-1).rows[0].context'),'case_login');assert.equal(run('inputContext'),'');
console.log('PASS: static receipts, explicit task context, multiline/empty sends, batch identity and scroll, unread results, page return, draft/context preservation. Browser layout and touch behavior are not verified.');
