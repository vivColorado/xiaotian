/* Three immutable receipt snapshots; every receipt opens the same live task. */
const SHOP_STORY_REQUEST='家里牛奶和小包吃的菜没有了，参考常买的帮我加购，优惠帮我用上。';
const SHOP_STORY_REPLY='可以换同品牌 950mL 的，蔬菜按两天的量准备，先加购物车，不要付款。';
function initShoppingStory(){if(S.v25)return;const t=item('shop');if(!t)return;const date=new Date(now().getTime()+28800000).toISOString().slice(0,10),at=time=>date+'T'+time;
S.shoppingStory={date,cards:[{key:'created',label:'已创建',at:'09:00',text:'已接下：核对常购清单与优惠，再为您加购。'},{key:'assist',label:'需您协助',at:'09:03',text:'常买牛奶缺货，可换同品牌 950mL 吗？蔬菜准备几天的量？'},{key:'done',label:'已完成',at:'09:07',text:'已按补充要求加购 5 件商品，优惠后 ¥105。未下单、未付款。'}]};
// Keep prior history in storage; replace only the old automatic demo receipts in the visible example.
S.messages.forEach(m=>{if(m.id==='shop'&&!m.input)m.supersededShoppingExample=true;});
Object.assign(t,{title:'给小包买菜',status:'done',stage:3,created:at('09:00'),startedAt:at('09:00'),finished:at('09:07'),archive:'pending',summary:'已按确认的牛奶规格和两天蔬菜用量完成模拟加购：5 件共 105 元，未下单付款。',result:'已模拟加购同品牌 950mL 鲜牛奶及两天用量的蔬菜，共 5 件，优惠后 105 元。加购任务已完成；请您核对购物车后自行下单支付。未实际下单或付款。'});
t.steps=[{title:'接收需求并整理常购清单',status:'done',summary:'已接下牛奶和蔬菜补货需求。',at:fmt(at('09:00')),end:fmt(at('09:02'))},{title:'向您确认缺货替代与用量',status:'done',summary:'您确认：同品牌 950mL，蔬菜按两天用量，先加购不付款。',at:fmt(at('09:03')),end:fmt(at('09:04'))},{title:'按补充要求核对优惠并加购',status:'done',summary:'已模拟加购 5 件商品，优惠后 105 元。',at:fmt(at('09:04')),end:fmt(at('09:07'))},{title:'汇报结果并交接支付',status:'done',summary:'购物车结果已交给您；下单与支付由您完成。',at:fmt(at('09:07')),end:fmt(at('09:07'))}];
t.confirmations=(t.confirmations||[]).filter(q=>!['milk_choice','payment_handoff','story_specs'].includes(q.id));t.confirmations.push({id:'story_specs',question:'常买牛奶缺货，可换同品牌 950mL 吗？蔬菜准备几天的量？',at:at('09:03'),blocking:true,options:['同品牌 950mL，蔬菜两天用量'],answer:SHOP_STORY_REPLY,answeredAt:at('09:04')},{id:'payment_handoff',question:'商品已加购，请您核对购物车后自行下单支付。',at:at('09:07'),blocking:false,actionLabel:'请您下单',options:['我已下单支付','暂时不下单']});
t.updates=[...(t.updates||[]),{text:SHOP_STORY_REPLY,at:at('09:04')}];addCartFile();S.v25=true;save();}
function shoppingStoryCard(card){return unifiedTaskCard({id:'shop',title:'给小包买菜',theme:'家庭购物',kind:'oneoff',storyKey:card.key,status:card.key==='assist'?'wait_user':card.key==='done'?'done':'todo',receiptAction:card.key==='created'?'创建':'更新',receiptTime:card.at,plan:card.text,summary:card.text});}

v6HomePrefix=function(){const cards=S.shoppingStory?.cards||[];if(cards.length!==3)return '';const quote=requestQuote({quote:SHOP_STORY_REQUEST});return `${assistant('<p>有什么事，直接吩咐我就好。</p>')}<div class="user-msg">${SHOP_STORY_REQUEST}</div>${assistant('<p>收到，我先核对常购清单和优惠，加购后告诉您。</p>'+shoppingStoryCard(cards[0]))}<div class="user-msg">你可以同时帮我处理别的事吗？</div>${assistant('<p>可以，买菜会继续处理。其他事情，您接着说就好。</p>')}<div class="story-time">09:03</div>${assistant(quote+'<p>有两个小地方，需要您确认一下。</p>'+shoppingStoryCard(cards[1]))}<div class="user-msg">${SHOP_STORY_REPLY}</div>${assistant('<p>收到，就按这个来。我继续核对优惠并加购。</p>')}<div class="story-time">3 分钟后</div>${assistant(quote+'<p>已按您的要求加购好了，购物车和明细放在任务详情里。</p>'+shoppingStoryCard(cards[2]))}`;};
const initBeforeShoppingStory=initWorkbench;
initWorkbench=function(){initBeforeShoppingStory();initShoppingStory();};
initShoppingStory();render();
