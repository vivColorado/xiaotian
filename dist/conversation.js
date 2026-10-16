/* Conversation presentation and reading state. Task data stays in the shared store. */
I.keyboard='M3 5h18v14H3zM6 9h1m3 0h1m3 0h1m3 0h0M6 12h1m3 0h1m3 0h1m3 0h0M7 16h10';
const chatView={y:0,atEnd:false,visited:false,knownCount:null,unread:0,folds:new Map(),history:false};

function chatTime(at){return at?fmt(at):'';}
function chatReply(body,at=''){
 return `<div class="assistant-msg"><div class="speaker">${icon('spark')}<span>小天</span>${at?`<time>${esc(chatTime(at))}</time>`:''}</div>${body}</div>`;
}
function chatTurn(key,{input='',text='',cards='',quote='',at=''}={}){
 return `<section class="chat-turn" data-chat-entry="${esc(key)}">${input?`<div class="user-msg" aria-label="您的消息">${esc(input)}</div>`:''}${chatReply((quote?requestQuote({quote}):'')+(text?`<p>${esc(text)}</p>`:'')+cards,cards?'':at)}</section>`;
}
function conversationStory(){
 const cards=S.shoppingStory?.cards||[];if(cards.length!==3)return '';
 const date=S.shoppingStory.date,at=clock=>`${date}T${clock}`;
 return chatTurn('shopping-created',{input:SHOP_STORY_REQUEST,text:'收到，我先核对清单和优惠。',cards:shoppingStoryCard(cards[0]),at:at('09:00')})
 +chatTurn('shopping-chat',{input:'你可以同时帮我处理别的事吗？',text:'可以，买菜会继续处理。其他事情，您接着说就好。'})
 +chatTurn('shopping-help',{quote:SHOP_STORY_REQUEST,text:'有两处需要您确认，其他事情会继续处理。',cards:shoppingStoryCard(cards[1]),at:at('09:03')})
 +chatTurn('shopping-reply',{input:SHOP_STORY_REPLY,text:'收到，就按这个来。加购完成后告诉您。',at:at('09:04')})
 +chatTurn('shopping-done',{quote:SHOP_STORY_REQUEST,text:'加购好了，明细放在任务详情里。',cards:shoppingStoryCard(cards[2]),at:at('09:07')});
}
function ensureConversationSnapshots(){
 let changed=false;
 if(!S.v32){
  const start=ts(S.shoppingStory?.date+'T09:00');
  S.messages.forEach(m=>{if(!m.input&&m.at&&ts(m.at)<start)m.conversationHistory=true;});
  S.v32=true;changed=true;
 }
 S.messages.forEach(m=>{
  if(m.kind==='task_receipt'&&!m.snapshot&&entity(m.id)){m.snapshot=snapshot(entity(m.id));changed=true;}
  if(m.kind!=='task_receipt'&&!m.cards&&m.ids?.length){m.cards=m.ids.map(entity).filter(Boolean).map(snapshot);changed=true;}
 });
 if(changed)save();
}
function conversationMessage(m,index){
 const key='message-'+index;
 const task=m.snapshot;
 const cards=m.kind==='task_receipt'&&task?[{...task,receiptAction:m.action,receiptTime:chatTime(m.at)}]:(m.cards||[]).map(t=>({...t,receiptTime:chatTime(m.at)||t.receiptTime}));
 const quote=!m.input&&(m.action==='完成'||m.action==='需要确认')?(task?.quote||''):'';
 return chatTurn(key,{input:m.input,text:m.text,cards:batchCards(cards,key),quote,at:m.at});
}
home=function(){
 ensureConversationSnapshots();
 const earlier=[],current=[];
 S.messages.forEach((m,i)=>{if(m.supersededShoppingExample)return;(m.conversationHistory?earlier:current).push([m,i]);});
 return `<div class="conversation-view" aria-label="与小天的会话">
 <div class="chat-greeting">${icon('spark')}<p>有什么事，直接吩咐我就好。</p></div>
 ${earlier.length?`<details class="chat-history" data-chat-history><summary>更早的记录 <span>${earlier.length} 条 <i>⌄</i></span></summary><div>${earlier.map(([m,i])=>conversationMessage(m,i)).join('')}</div></details>`:''}
 ${conversationStory()}${current.map(([m,i])=>conversationMessage(m,i)).join('')}
 <p class="chat-endnote">任务与语音为模拟演示</p></div>`;
};

function captureConversationView(){
 const main=document.getElementById('main');if(main.dataset.page!=='home')return;
 chatView.y=main.scrollTop;chatView.atEnd=main.scrollHeight-main.clientHeight-main.scrollTop<72;chatView.visited=true;
 main.querySelectorAll('.batch-bundle').forEach(el=>chatView.folds.set(el.dataset.batch,{open:el.open,y:el.querySelector('.batch-grid')?.scrollTop||0}));
 const history=main.querySelector('[data-chat-history]');if(history)chatView.history=history.open;
}
function restoreConversationView(){
 const main=document.getElementById('main');if(S.page!=='home')return;
 const history=main.querySelector('[data-chat-history]');if(history)history.open=chatView.history;
 main.querySelectorAll('.batch-bundle').forEach(el=>{const state=chatView.folds.get(el.dataset.batch);if(state){el.open=state.open;const grid=el.querySelector('.batch-grid');if(grid)grid.scrollTop=state.y;}});
 main.scrollTop=chatView.visited&&chatView.atEnd?main.scrollHeight:chatView.y;
 syncConversationJump();
}
function syncConversationJump(){
 const main=document.getElementById('main'),button=document.getElementById('chat-latest');if(!button)return;
 const away=main.scrollHeight-main.clientHeight-main.scrollTop>100;
 button.hidden=S.page!=='home'||!away;
 if(S.page==='home'&&!away)chatView.unread=0;
 button.textContent=chatView.unread?`${chatView.unread} 条新进展 ↓`:'回到最新 ↓';
}
function jumpConversationLatest(){
 const main=document.getElementById('main');main.scrollTop=main.scrollHeight;
 chatView.y=main.scrollTop;chatView.atEnd=true;chatView.visited=true;chatView.unread=0;syncConversationJump();
}
const renderBeforeConversation=render;
render=function(){
 captureConversationView();
 renderBeforeConversation();
 const count=S.messages.filter(m=>!m.supersededShoppingExample).length;
 if(chatView.knownCount!==null&&count>chatView.knownCount&&!chatView.atEnd)chatView.unread+=count-chatView.knownCount;
 chatView.knownCount=count;
 document.getElementById('main').dataset.page=S.page;
 restoreConversationView();
};
const goBeforeConversation=go;
go=function(page){captureConversationView();goBeforeConversation(page);restoreConversationView();};
document.getElementById('main').addEventListener('scroll',()=>{captureConversationView();syncConversationJump();},{passive:true});

const mountBeforeConversation=mountVoice;
mountVoice=function(){
 mountBeforeConversation();
 document.getElementById('floating').insertAdjacentHTML('beforeend',`${!composerVisible?`<button class="composer-launch" onclick="openTextComposer()" aria-label="${S.dictationText?'继续编辑未发送的文字':'打开文字输入'}">${icon('keyboard')}<span>${S.dictationText?'继续编辑':'打字'}</span></button>`:''}<button class="chat-latest" id="chat-latest" onclick="jumpConversationLatest()" hidden aria-label="跳到最新会话"></button>`);
 syncConversationJump();updateComposerActions();
 const status=document.getElementById('composer-status');if(status)status.textContent=listening?'语音演示 · 再点结束':'可修改，确认后发送';
};
function updateComposerActions(){
 const ready=!!S.dictationText.trim();
 const send=document.getElementById('composer-send'),draft=document.getElementById('composer-save');
 if(send)send.disabled=!ready;if(draft)draft.disabled=!ready;
}
function clearComposerContext(){inputContext='';voiceContext='';drawComposer();mountVoice();}
drawComposer=function(){
 const previous=document.getElementById('input'),editing=previous&&document.activeElement===previous;
 const caret=editing?{start:previous.selectionStart,end:previous.selectionEnd,y:previous.scrollTop}:null;
 const context=entity(inputContext);
 document.getElementById('footer').innerHTML=composerVisible?`<div class="compact-input ${composerExpanded?'expanded':''}">
 ${context?`<div class="composer-context"><span>补充 · ${esc(context.title)}</span><button onclick="clearComposerContext()" aria-label="取消任务关联，改为新的吩咐">×</button></div>`:''}
 <div class="composer-hint"><span id="composer-status">${listening?'语音演示 · 再点结束':'可修改，确认后发送'}</span><div class="composer-tools"><button onclick="toggleComposerSize()" aria-expanded="${composerExpanded}">${composerExpanded?'缩小':'展开'}</button><button id="composer-save" onclick="storeInlineDraft()" ${S.dictationText.trim()?'':'disabled'}>暂存</button><button onclick="hideComposer()" aria-label="收起输入框，保留文字">收起</button></div></div>
 <div class="composer"><button class="iconbtn" onclick="chooseFile(inputContext)" aria-label="添加附件">${icon('plus')}</button><textarea id="input" rows="1" aria-label="吩咐小天" placeholder="一句话、一件事，都可以…" oninput="editDictation(this.value)" onkeydown="if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)&&!event.isComposing){event.preventDefault();sendInput()}">${esc(S.dictationText)}</textarea><button class="send" id="composer-send" onclick="sendInput()" ${S.dictationText.trim()?'':'disabled'} aria-label="发送吩咐" title="发送（Ctrl / ⌘ + Enter）">${icon('arrow')}</button></div></div>`:'';
 if(caret&&composerVisible){const field=document.getElementById('input');field.focus({preventScroll:true});field.setSelectionRange?.(caret.start,caret.end);field.scrollTop=caret.y;}
};
const editBeforeConversation=editDictation,syncBeforeConversation=syncDictationField;
editDictation=function(value){editBeforeConversation(value);updateComposerActions();};
syncDictationField=function(){syncBeforeConversation();updateComposerActions();};
const sendBeforeConversation=sendInput;
sendInput=function(){
 if(!(document.getElementById('input')?.value||S.dictationText||'').trim())return;
 sendBeforeConversation();voiceContext='';jumpConversationLatest();
};
const storeBeforeConversation=storeInlineDraft;
storeInlineDraft=function(){
 if(!S.dictationText.trim())return;
 voiceContext=inputContext||'';storeBeforeConversation();inputContext='';voiceContext='';toast('已暂存，还没有发送。');
};
render();
