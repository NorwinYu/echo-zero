/* 零号信标 · 视觉小说引擎
   纯原生 JS；无框架、无后端。 */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const STORY=window.STORY, SPEAKERS=window.SPEAKERS, ASSETS=window.AI_ASSETS||{bg:{},char:{},video:{},voice:{}};
const SAVE_PREFIX='echo_zero_save_';
const PROGRESS_KEY='echo_zero_progress_v1';
const SETTINGS_KEY='echo_zero_settings_v2';
const DEFAULT_SETTINGS={textSpeed:18,autoDelay:1.2,music:.16,voice:.95,sfx:.55,reduceMotion:false};
let SETTINGS={...DEFAULT_SETTINGS};
const S={sceneId:null,line:0,flags:{},history:[],auto:true,skip:false,typing:false,voiceDone:true,voiceToken:0,started:false,ending:false,paused:false,chapterCardTimer:null,autoTimer:null,skipTimer:null};
let modalOpen=false;

/* ---------------- 工具 ---------------- */
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function toast(msg,ms=1800){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),ms);}
function loadJSON(k,def){try{const v=localStorage.getItem(k);return v?JSON.parse(v):def;}catch(e){return def;}}
function saveJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function progress(){return loadJSON(PROGRESS_KEY,{seenBgs:{},chapters:{prologue:true},endings:{}});}
function saveProgress(p){saveJSON(PROGRESS_KEY,p);}
function markSeenBg(id){if(!id)return;const p=progress();p.seenBgs[id]=true;saveProgress(p);}
function markChapter(id){const p=progress();p.chapters[id]=true;saveProgress(p);}
function markEnding(id){const p=progress();p.endings[id]=true;saveProgress(p);}
function sceneData(id){return STORY.scenes[id];}
function chapterData(id){return STORY.chapters[id]||{no:'',title:'',sub:''};}
function currentLine(){return sceneData(S.sceneId)?.lines?.[S.line];}
function voiceFor(line){return line&&ASSETS.voice&&ASSETS.voice[line.id]||null;}
function bgFor(id){return ASSETS.bg&&ASSETS.bg[id]||null;}
function charFor(id){return ASSETS.char&&ASSETS.char[id]||null;}
function applySettings(){
  document.documentElement.classList.toggle('reduce-motion',!!SETTINGS.reduceMotion);
  AUDIO.setVolume('music',SETTINGS.music);AUDIO.setVolume('voice',SETTINGS.voice);AUDIO.setVolume('sfx',SETTINGS.sfx);
}
function saveSettings(){saveJSON(SETTINGS_KEY,SETTINGS);applySettings();}
function loadSettings(){SETTINGS=Object.assign({},DEFAULT_SETTINGS,loadJSON(SETTINGS_KEY,{}));applySettings();}

/* ---------------- 弹窗 ---------------- */
function openModal({kicker='',title='',body='',footer='',wide=false,onMount=null}){
  modalOpen=true;
  $('#modalKicker').textContent=kicker;
  $('#modalTitle').textContent=title;
  $('#modalBody').innerHTML=body;
  $('#modalFoot').innerHTML=footer;
  $('#modal').classList.toggle('wide',wide);
  $('#modalBackdrop').classList.add('show');
  if(onMount) onMount($('#modal'));
}
function closeModal(){modalOpen=false;$('#modalBackdrop').classList.remove('show');}
function refreshModal(){/* 简单重绘由调用方处理 */}
$('#modalClose').addEventListener('click',closeModal);
$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal();});

/* ---------------- 标题 ---------------- */
function initTitle(){
  const bg=bgFor('title'); if(bg) $('#titleBg').style.backgroundImage=`url('${bg}')`;
  const cont=$('[data-action="continue"]'); if(cont) cont.classList.toggle('disabled',!hasAnySave());
}
function hasAnySave(){return ['auto','1','2','3'].some(s=>!!localStorage.getItem(SAVE_PREFIX+s));}
function showTitle(){
  stopAllTimers();AUDIO.stopVoice();AUDIO.startMusic('menu');
  $('#gameScreen').classList.remove('active');$('#titleScreen').classList.add('active');
  const ev=$('#endingVideo'); if(ev){ev.pause();}
  $('#endingLayer').classList.remove('show');$('#sideEndLayer').classList.remove('show');$('#choiceLayer').classList.remove('show');
  S.started=false;setChar(null);initTitle();
}
function hideTitle(){$('#titleScreen').classList.remove('active');$('#gameScreen').classList.add('active');}

/* ---------------- 开场 ---------------- */
function startNew(){
  S.sceneId=null;S.line=0;S.flags={};S.history=[];S.auto=true;S.skip=false;S.ending=false;S.paused=false;
  S.voiceToken++;AUDIO.stopVoice();S.started=true;setChar(null);hideTitle();
  AUDIO.preloadVoice(ASSETS.voice&&ASSETS.voice.v001);
  const ov=$('#openingLayer'), v=$('#openingVideo');
  const src=ASSETS.video&&ASSETS.video.opening;
  if(src&&!SETTINGS.reduceMotion){
    v.src=src;v.currentTime=0;ov.classList.add('show');
    const done=()=>{if(!ov.classList.contains('show'))return;ov.classList.remove('show');v.pause();enterScene('prologue');};
    v.onended=done;v.onerror=done;
    v.play().catch(done);
    clearTimeout(ov._t);ov._t=setTimeout(done,6500);
  }else{
    enterScene('prologue');
  }
}
function skipOpening(){
  const ov=$('#openingLayer'),v=$('#openingVideo');
  ov.classList.remove('show');v.pause();clearTimeout(ov._t);
  if(!S.sceneId)enterScene('prologue');
}

/* ---------------- 场景 ---------------- */
function enterScene(id){
  const sc=sceneData(id); if(!sc){toast('场景缺失：'+id);return;}
  S.sceneId=id;S.line=0;S.ending=id.startsWith('ending_');S.skip=false;S.auto=true;S.started=true;setChar(null);
  const ch=chapterData(sc.chapter);
  $('#chapterNo').textContent=ch.no;$('#chapterTitle').textContent=ch.title;
  setBg(sc.bg);markSeenBg(sc.bg);
  if(sc.bgm)AUDIO.startMusic(sc.bgm);
  if(sc.lines&&sc.lines[0])AUDIO.preloadVoice(voiceFor(sc.lines[0]));
  markChapter(sc.chapter);
  saveAuto();
  showChapterCard(ch);updateToggleButtons();
  clearTimeout(S.chapterCardTimer);
  S.chapterCardTimer=setTimeout(()=>{hideChapterCard();renderLine();},SETTINGS.reduceMotion?200:1700);
  $('#choiceLayer').classList.remove('show');$('#endingLayer').classList.remove('show');$('#characterStage').classList.remove('dim');
  $('#dialogueWrap').classList.add('show');
}
function showChapterCard(ch){
  const el=$('#chapterCard');$('#ccNo').textContent=ch.no;$('#ccTitle').textContent=ch.title;$('#ccSub').textContent=ch.sub||'';
  el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
}
function hideChapterCard(){$('#chapterCard').classList.remove('show');}

function setBg(id){
  if(!id)return;const src=bgFor(id);if(!src)return;
  const a=$('#bgA'),b=$('#bgB');
  const front=a.classList.contains('show')?b:a;
  const back=front===a?b:a;
  front.style.backgroundImage=`url('${src}')`;
  front.classList.add('show');back.classList.remove('show');
  markSeenBg(id);
}
function setChar(id,opts={}){
  const img=$('#charImg'),stage=$('#characterStage');
  if(id===null){stage.classList.remove('show');return;}
  if(!id)return;
  const src=charFor(id);if(!src){stage.classList.remove('show');return;}
  img.src=src;stage.classList.add('show');
  stage.dataset.char=id;
  stage.classList.toggle('hologram',id.startsWith('xian'));
  stage.classList.toggle('right',!!opts.right);
}
function setSpeaker(sp){
  const d=SPEAKERS[sp]||SPEAKERS.narrator;
  $('#speakerName').textContent=d.name;$('#speakerName').style.color=d.color;
  $('#speakerEn').textContent=(sp||'narrator').toUpperCase();
  $('#dialogueWrap').classList.toggle('narration',sp==='narrator'||sp==='system');
}

/* ---------------- 行 ---------------- */
function renderLine(){
  const sc=sceneData(S.sceneId);if(!sc)return;
  const line=sc.lines[S.line];if(!line){sceneEnd();return;}
  S.typing=true;S.voiceDone=!voiceFor(line);
  if(line.bg){setBg(line.bg);markSeenBg(line.bg);}
  if('char' in line)setChar(line.char);
  setSpeaker(line.sp);
  $('#lineCount').textContent=`${String(S.line+1).padStart(2,'0')} / ${String(sc.lines.length).padStart(2,'0')}`;
  $('#dialogueText').textContent='';$('#continueMark').classList.remove('show');
  if(line.sfx)AUDIO.sfx(line.sfx);
  if(line.fx==='glitch'){const g=$('#gameScreen');g.classList.add('glitch');setTimeout(()=>g.classList.remove('glitch'),420);}
  S.history.push({sp:line.sp,text:line.text});
  if(S.history.length>200)S.history.shift();
  const voice=voiceFor(line);
  const nextLine=sc.lines[S.line+1];if(nextLine)AUDIO.preloadVoice(voiceFor(nextLine));
  if(voice&&!SETTINGS.reduceMotion){
    const token=++S.voiceToken;AUDIO.duck(true);
    AUDIO.playVoice(voice).then(()=>{if(token===S.voiceToken){AUDIO.duck(false);S.voiceDone=true;if(S.auto)scheduleAuto();}});
  }else{S.voiceDone=true;AUDIO.duck(false);}
  typeText(line.text,()=>{S.typing=false;$('#continueMark').classList.add('show');if(S.auto)scheduleAuto();});
}
function typeText(text,done){
  const el=$('#dialogueText');el.textContent='';
  if(SETTINGS.reduceMotion){el.textContent=text;done();return;}
  let i=0;const arr=[...text];clearInterval(el._timer);
  el._timer=setInterval(()=>{
    if(!S.typing){clearInterval(el._timer);el.textContent=text;done();return;}
    el.textContent+=arr[i++]||'';
    if(i>=arr.length){clearInterval(el._timer);el.textContent=text;done();}
  },Math.max(6,SETTINGS.textSpeed));
}
function finishTyping(){
  if(!S.typing)return;
  const line=currentLine();S.typing=false;clearInterval($('#dialogueText')._timer);
  $('#dialogueText').textContent=line?line.text:'';$('#continueMark').classList.add('show');
  if(S.auto)scheduleAuto();
}
function advance(){
  if(modalOpen||!S.started)return;
  if($('#chapterCard').classList.contains('show'))return;
  if($('#choiceLayer').classList.contains('show'))return;
  if(S.typing){finishTyping();return;}
  const sc=sceneData(S.sceneId);if(!sc)return;
  if(S.line<sc.lines.length-1){S.line++;saveAuto();renderLine();return;}
  sceneEnd();
}
function sceneEnd(){
  const sc=sceneData(S.sceneId);if(!sc)return;
  if(sc.side||S.sceneId.startsWith('side_')){showSideEnd();return;}
  if(sc.choice){showChoice(sc.choice);return;}
  if(S.sceneId.startsWith('ending_')){showEnding(S.sceneId);return;}
  // 没有 choice 的普通场景：回标题（当前故事不应触发）
  showEnding('ending_rest');
}
function scheduleAuto(){
  clearTimeout(S.autoTimer);
  if(!S.auto||S.typing||modalOpen)return;
  const delay=SETTINGS.autoDelay*1000;
  const run=()=>{if(!S.auto||S.typing||modalOpen)return;advance();};
  if(!S.voiceDone){S.autoTimer=setTimeout(()=>{if(S.voiceDone)run();else scheduleAuto();},500);return;}
  S.autoTimer=setTimeout(run,delay);
}

/* ---------------- 选项 ---------------- */
function showChoice(choice){
  S.skip=false;S.auto=false;updateToggleButtons();
  $('#dialogueWrap').classList.remove('show');$('#characterStage').classList.add('dim');
  $('#choicePrompt').textContent=choice.prompt||'';
  $('#choiceList').innerHTML=choice.options.map((o,i)=>`<button class="choice-btn" data-choice="${i}"><span class="choice-index">0${i+1}</span><span class="choice-text">${esc(o.text)}</span><span class="choice-sub">${esc(o.sub||'')}</span></button>`).join('');
  $('#choiceLayer').classList.add('show');
  $$('#choiceList .choice-btn').forEach(b=>b.addEventListener('click',()=>{
    const o=choice.options[+b.dataset.choice];if(!o)return;
    Object.assign(S.flags,o.set||{});AUDIO.sfx('ui');$('#choiceLayer').classList.remove('show');
    enterScene(o.goto);
  }));
}
function showEnding(id){
  S.ending=true;S.auto=false;S.skip=false;updateToggleButtons();AUDIO.stopVoice();
  const ch=chapterData(id);markEnding(id);setChar(null);
  const ev=$('#endingVideo'); const esrc=ASSETS.video&&ASSETS.video.ending;
  if(esrc&&id==='ending_echo'){ ev.src=esrc;ev.play().catch(()=>{}); } else { ev.pause();ev.removeAttribute('src'); }
  $('#endingTitle').textContent=ch.title||'信号终止';
  $('#endingSub').textContent=id==='ending_echo'?'城市听见了。代价是，林汐的回声从此只存在于档案里。':'你让告别发生了。也把林汐留在了只有你记得的地方。';
  $('#dialogueWrap').classList.remove('show');$('#choiceLayer').classList.remove('show');
  $('#endingLayer').classList.add('show');
  AUDIO.startMusic(id==='ending_echo'?'ending':'silence');
  saveAuto();
}

/* ---------------- 存档 ---------------- */
function serialize(){return {scene:S.sceneId,line:S.line,flags:{...S.flags},history:S.history.slice(-120),ts:Date.now()};}
function saveGame(slot='auto'){
  if(!S.sceneId)return false;
  saveJSON(SAVE_PREFIX+slot,serialize());
  return true;
}
function saveAuto(){if(S.sceneId)saveGame('auto');}
function loadGame(slot='auto'){
  const data=loadJSON(SAVE_PREFIX+slot,null);if(!data||!sceneData(data.scene))return false;
  hideTitle();setChar(null);S.sceneId=data.scene;S.line=Math.max(0,data.line|0);S.flags=data.flags||{};S.history=data.history||[];
  S.started=true;S.ending=false;S.auto=true;S.skip=false;updateToggleButtons();
  const sc=sceneData(S.sceneId),ch=chapterData(sc.chapter);
  $('#chapterNo').textContent=ch.no;$('#chapterTitle').textContent=ch.title;
  let bg=sc.bg,charId=null;for(let i=0;i<=S.line&&i<sc.lines.length;i++){const l=sc.lines[i];if(l.bg)bg=l.bg;if('char' in l)charId=l.char;}
  setBg(bg);setChar(charId);if(sc.bgm)AUDIO.startMusic(sc.bgm);
  $('#dialogueWrap').classList.add('show');$('#choiceLayer').classList.remove('show');$('#endingLayer').classList.remove('show');
  if(S.line>=sc.lines.length&&sc.choice){showChoice(sc.choice);return true;}
  AUDIO.preloadVoice(voiceFor(sc.lines[S.line]));
  renderLine();return true;
}
function slotInfo(slot){const d=loadJSON(SAVE_PREFIX+slot,null);if(!d)return null;const ch=chapterData(sceneData(d.scene)?.chapter);return {slot,scene:d.scene,line:d.line,chapter:ch,date:new Date(d.ts||Date.now()).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})};}

/* ---------------- 控件 ---------------- */
function updateToggleButtons(){
  $('[data-game="auto"]').classList.toggle('active',S.auto);
  $('[data-game="skip"]').classList.toggle('active',S.skip);
}
function toggleAuto(){S.auto=!S.auto;S.skip=false;updateToggleButtons();toast(S.auto?'自动播放：开':'自动播放：关');if(S.auto)scheduleAuto();else clearTimeout(S.autoTimer);}
function toggleSkip(){
  S.skip=!S.skip;S.auto=false;updateToggleButtons();
  clearTimeout(S.skipTimer);
  if(S.skip){AUDIO.stopVoice();const tick=()=>{if(!S.skip||modalOpen)return;if($('#chapterCard').classList.contains('show')){S.skipTimer=setTimeout(tick,180);return;}if($('#choiceLayer').classList.contains('show')){S.skip=false;updateToggleButtons();return;}finishTyping();advance();S.skipTimer=setTimeout(tick,110);};tick();}
}
function openLog(){
  const body=S.history.length?`<div class="log-list">${S.history.map(h=>`<div class="log-line"><b style="color:${(SPEAKERS[h.sp]||SPEAKERS.narrator).color}">${esc((SPEAKERS[h.sp]||SPEAKERS.narrator).name)}</b><p>${esc(h.text)}</p></div>`).join('')}</div>`:'<div class="empty">还没有记录。</div>';
  openModal({kicker:'BACKLOG',title:'回声记录',body,footer:'<button class="mbtn" data-close>关闭</button>',onMount:root=>{root.querySelector('[data-close]')?.addEventListener('click',closeModal);const l=root.querySelector('.log-list');if(l)l.scrollTop=l.scrollHeight;}});
}
function openSave(){
  const slots=['auto','1','2','3'];
  const body=`<div class="save-list">${slots.map(s=>{const i=slotInfo(s);return `<div class="save-slot ${i?'':'empty'}"><div class="save-no">${s==='auto'?'A':s}</div><div class="save-meta"><b>${i?i.chapter.no+' · '+i.chapter.title:'空档位'}</b><span>${i?i.date+' · 行 '+(i.line+1):'—'}</span></div><div class="save-btns"><button class="mini-btn" data-save="${s}">${i?'覆盖':'保存'}</button>${i?`<button class="mini-btn" data-load="${s}">读取</button>`:''}</div></div>`;}).join('')}</div><div class="modal-note">存档保存在浏览器 localStorage。换浏览器/域名不会同步。</div>`;
  openModal({kicker:'SAVE / LOAD',title:'信号存档',body,footer:'<button class="mbtn" data-close>关闭</button>',onMount:root=>{
    root.querySelector('[data-close]')?.addEventListener('click',closeModal);
    root.querySelectorAll('[data-save]').forEach(b=>b.addEventListener('click',()=>{if(saveGame(b.dataset.save)){AUDIO.sfx('ui');toast('已写入存档 '+b.dataset.save);closeModal();openSave();}}));
    root.querySelectorAll('[data-load]').forEach(b=>b.addEventListener('click',()=>{closeModal();if(loadGame(b.dataset.load)){toast('信号已恢复');AUDIO.sfx('power');}}));
  }});
}
function openSettings(){
  const body=`
    <div class="setting-row"><label>文字速度</label><input type="range" min="8" max="45" step="1" value="${SETTINGS.textSpeed}" data-set="textSpeed"><span>${SETTINGS.textSpeed}ms</span></div>
    <div class="setting-row"><label>自动等待</label><input type="range" min="0" max="3" step="0.1" value="${SETTINGS.autoDelay}" data-set="autoDelay"><span>${SETTINGS.autoDelay.toFixed(1)}s</span></div>
    <div class="setting-row"><label>音乐</label><input type="range" min="0" max="1" step="0.01" value="${SETTINGS.music}" data-set="music"><span>${Math.round(SETTINGS.music*100)}%</span></div>
    <div class="setting-row"><label>配音</label><input type="range" min="0" max="1" step="0.01" value="${SETTINGS.voice}" data-set="voice"><span>${Math.round(SETTINGS.voice*100)}%</span></div>
    <div class="setting-row"><label>音效</label><input type="range" min="0" max="1" step="0.01" value="${SETTINGS.sfx}" data-set="sfx"><span>${Math.round(SETTINGS.sfx*100)}%</span></div>
    <div class="setting-row"><label>减少动态</label><input type="checkbox" data-set="reduceMotion" ${SETTINGS.reduceMotion?'checked':''}><span>关闭强动效</span></div>
    <div class="modal-note">配音为 Edge 神经 TTS 生成；BGM 由 MiniMax Music3 生成；音效由 WebAudio 合成。均为原创/非商业。</div>`;
  openModal({kicker:'SETTINGS',title:'接收设置',body,footer:'<button class="mbtn primary" data-close>完成</button>',onMount:root=>{
    root.querySelector('[data-close]')?.addEventListener('click',()=>{saveSettings();closeModal();});
    root.querySelectorAll('[data-set]').forEach(inp=>inp.addEventListener('input',()=>{
      const k=inp.dataset.set;let v=inp.type==='checkbox'?inp.checked:(inp.type==='range'?parseFloat(inp.value):inp.value);
      SETTINGS[k]=v;applySettings();saveSettings();const span=inp.parentElement.querySelector('span:last-child');if(span){if(k==='textSpeed')span.textContent=v+'ms';else if(k==='autoDelay')span.textContent=Number(v).toFixed(1)+'s';else if(['music','voice','sfx'].includes(k))span.textContent=Math.round(v*100)+'%';}
    }));
  }});
}
function openSideStories(){
  const sides=STORY.sideStories||[];
  const body=`<div class="side-grid">${sides.map(x=>`<button class="side-card" data-side="${x.id}"><span class="side-no">${x.no}</span><b>${esc(x.title)}</b><em>${esc(x.char||'')}</em><p>${esc(x.desc||'')}</p><i>开始阅读 ↗</i></button>`).join('')}</div><div class="modal-note">记忆碎片为独立支线，不改变主线选择与结局；可随时返回标题。</div>`;
  openModal({kicker:'MEMORY FRAGMENTS',title:'记忆碎片',body,wide:true,footer:'<button class="mbtn" data-close>关闭</button>',onMount:root=>{
    root.querySelector('[data-close]')?.addEventListener('click',closeModal);
    root.querySelectorAll('[data-side]').forEach(b=>b.addEventListener('click',()=>{closeModal();startSideStory(b.dataset.side);}));
  }});
}
function startSideStory(id){
  if(!sceneData(id))return;
  S.sideStory=id;S.started=true;S.auto=true;S.skip=false;S.ending=false;
  setChar(null);hideTitle();
  $('#sideEndLayer').classList.remove('show');
  enterScene(id);
}
function showSideEnd(){
  S.auto=false;S.skip=false;updateToggleButtons();AUDIO.stopVoice();setChar(null);
  const ch=chapterData(S.sceneId);
  $('#sideEndTitle').textContent=ch.title||'记忆碎片';
  $('#sideEndSub').textContent='这段记忆已经读完。主线不会因此改变。';
  $('#dialogueWrap').classList.remove('show');$('#choiceLayer').classList.remove('show');
  $('#sideEndLayer').classList.add('show');
  saveAuto();
}
function openGallery(){
  const p=progress();const names={title:'主视觉 · 栖霞环',archive:'第47层 · 信号档案室',descent:'下潜 · 风暴云层',tidal:'潮汐城 · 黑水街道',core:'记忆核心',tower:'白塔档案馆',broadcast:'档案阵列 · 黎明',silence:'静默 · 机库'};
  const body=`<div class="gallery-grid">${Object.keys(names).map(id=>{const seen=p.seenBgs[id];const src=bgFor(id);return `<button class="gallery-card ${seen?'':'locked'}" data-bg="${id}">${src?`<img src="${src}" loading="lazy" alt="">`:''}<span>${seen?names[id]:'未解锁'}</span></button>`;}).join('')}</div>
    <div class="ending-row"><span>结局</span><b class="${p.endings.ending_echo?'unlocked':''}">回声</b><b class="${p.endings.ending_rest?'unlocked':''}">安息</b></div>`;
  openModal({kicker:'GALLERY',title:'回声画廊',body,wide:true,footer:'<button class="mbtn" data-close>关闭</button>',onMount:root=>{
    root.querySelector('[data-close]')?.addEventListener('click',closeModal);
    root.querySelectorAll('[data-bg]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.bg;if(!progress().seenBgs[id]){toast('尚未解锁');return;}const src=bgFor(id);openModal({kicker:'ARCHIVE',title:names[id],body:`<img class="gallery-big" src="${src}" alt="">`,wide:true,footer:'<button class="mbtn" data-close>返回</button>',onMount:r=>r.querySelector('[data-close]')?.addEventListener('click',openGallery)});}));
  }});
}
function openChapters(){
  const p=progress();const list=[['prologue','序章','死频'],['ch1','第一章','下潜'],['ch2','第二章','白塔']];
  const body=`<div class="chapter-list">${list.map(([id,no,title])=>`<button class="chapter-btn ${p.chapters[id]?'':'locked'}" data-chapter="${id}"><span>${no}</span><b>${title}</b><em>${p.chapters[id]?'可进入':'未解锁'}</em></button>`).join('')}</div><div class="modal-note">章节选择会从该章开头重新开始；已解锁结局保留。</div>`;
  openModal({kicker:'CHAPTERS',title:'章回选择',body,footer:'<button class="mbtn" data-close>关闭</button>',onMount:root=>{
    root.querySelector('[data-close]')?.addEventListener('click',closeModal);
    root.querySelectorAll('[data-chapter]').forEach(b=>b.addEventListener('click',()=>{if(!progress().chapters[b.dataset.chapter]){toast('尚未解锁');return;}closeModal();startChapter(b.dataset.chapter);}));
  }});
}
function startChapter(id){
  S.sceneId=null;S.line=0;S.flags={};S.history=[];S.auto=true;S.skip=false;S.ending=false;S.started=true;
  hideTitle();enterScene(id);
}
function openCredits(){
  openModal({kicker:'CREDITS',title:'制作名单',body:`
    <div class="credits">
      <p><b>零号信标 · ECHO ZERO</b><br>原创未来科幻视觉小说 Demo</p>
      <p><span>故事 / 代码 / UI / 音效</span><b>DeepSeek Flash</b></p>
      <p><span>场景 / 角色 / 片头片尾 / BGM</span><b>MiniMax H3</b></p>
      <p><span>中文配音</span><b>Edge 神经 TTS</b></p>
      <p class="small">非商业技术实验。全部视觉素材为 AI 生成；故事、角色、文本均为原创，不含任何现有作品角色或剧情。代码 MIT；生成素材 CC BY-NC 4.0。</p>
    </div>`,footer:'<button class="mbtn" data-close>关闭</button>',onMount:r=>r.querySelector('[data-close]')?.addEventListener('click',closeModal)});
}
function openPause(){
  if(!S.started)return;S.paused=true;
  openModal({kicker:'PAUSED',title:'信号暂停',body:`<div class="pause-list"><button class="pause-btn" data-p="resume">继续接收</button><button class="pause-btn" data-p="save">存档 / 读档</button><button class="pause-btn" data-p="settings">设置</button><button class="pause-btn" data-p="log">回看记录</button><button class="pause-btn danger" data-p="title">返回标题</button></div>`,onMount:root=>{
    root.querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.p;closeModal();S.paused=false;if(a==='resume')return;if(a==='save')openSave();if(a==='settings')openSettings();if(a==='log')openLog();if(a==='title'){if(confirm('返回标题？当前进度会自动保存。'))showTitle();}}));
  }});
}

/* ---------------- 事件 ---------------- */
function bind(){
  $$('#titleScreen [data-action]').forEach(b=>b.addEventListener('click',()=>{
    AUDIO.resume();if(!S.started)AUDIO.startMusic('menu');const a=b.dataset.action;
    if(a==='new')startNew();
    else if(a==='continue'){if(loadGame('auto'))toast('信号已恢复');else toast('没有存档');}
    else if(a==='chapters')openChapters();
    else if(a==='sides')openSideStories();
    else if(a==='gallery')openGallery();
    else if(a==='settings')openSettings();
    else if(a==='credits')openCredits();
  }));
  $$('#gameScreen [data-game]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const a=b.dataset.game;if(a==='auto')toggleAuto();if(a==='skip')toggleSkip();if(a==='log')openLog();if(a==='save')openSave();if(a==='menu')openPause();}));
  $('#dialogueWrap').addEventListener('click',e=>{e.stopPropagation();if(!modalOpen)advance();});
  $('#gameScreen').addEventListener('click',e=>{if(e.target.closest('button')||e.target.closest('.choice-layer')||e.target.closest('.ending-layer')||e.target.closest('.side-end-layer')||e.target.closest('.opening-layer'))return;if(!modalOpen)advance();});
  $('#skipOpening').addEventListener('click',e=>{e.stopPropagation();skipOpening();});
  $('#modalClose').addEventListener('click',closeModal);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(modalOpen)closeModal();else if(S.started)openPause();return;}
    if(modalOpen)return;
    if(e.code==='Space'||e.key==='Enter'){e.preventDefault();if(S.started)advance();}
    else if(e.key==='a'||e.key==='A')toggleAuto();
    else if(e.key==='s'||e.key==='S')toggleSkip();
    else if(e.key==='l'||e.key==='L')openLog();
  });
  $('#endingLayer').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;if(b.dataset.action==='backTitle')showTitle();if(b.dataset.action==='gallery')openGallery();});
  $('#sideEndLayer').addEventListener('click',e=>{const b=e.target.closest('[data-side-action]');if(!b)return;if(b.dataset.sideAction==='title')showTitle();if(b.dataset.sideAction==='sides')openSideStories();});
  // 首次交互初始化音频
  ['pointerdown','touchstart','keydown'].forEach(ev=>document.addEventListener(ev,()=>AUDIO.resume(),{passive:true}));
  document.addEventListener('WeixinJSBridgeReady',()=>AUDIO.resume(),false);
  if(window.WeixinJSBridge)AUDIO.resume();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)AUDIO.resume();});
  let soundHinted=false;
  document.addEventListener('pointerdown',()=>setTimeout(()=>{
    if(soundHinted)return;
    const st=AUDIO.status;
    if(st.ctx!=='running'||(st.bgm&&st.bgm.paused)){
      soundHinted=true;
      toast('没有声音？点一下屏幕，并检查手机静音开关',4200);
    }
  },2600),{once:true});
}
function stopAllTimers(){clearTimeout(S.chapterCardTimer);clearTimeout(S.autoTimer);clearTimeout(S.skipTimer);}

/* ---------------- 启动 ---------------- */
function setBoot(pct,text){
  const fill=$('#bootFill'),st=$('#bootStatus');
  if(fill)fill.style.width=Math.max(0,Math.min(100,pct))+'%';
  if(st&&text)st.textContent=text;
}
function preloadImage(src){
  return new Promise(resolve=>{
    if(!src){resolve(false);return;}
    const im=new Image();
    let done=false;
    const fin=ok=>{if(done)return;done=true;resolve(ok);};
    im.onload=()=>fin(true);im.onerror=()=>fin(false);
    im.src=src;
    setTimeout(()=>fin(false),12000);
  });
}
function preloadVideoMeta(src){
  return new Promise(resolve=>{
    if(!src){resolve(false);return;}
    const v=document.createElement('video');v.preload='metadata';v.muted=true;
    let done=false;const fin=ok=>{if(done)return;done=true;resolve(ok);};
    v.onloadedmetadata=()=>fin(true);v.onerror=()=>fin(false);
    v.src=src;setTimeout(()=>fin(false),5000);
  });
}
async function boot(){
  loadSettings();
  initTitle(); // start title background immediately, before the preload gate
  const bg=Object.values(ASSETS.bg||{}).filter(Boolean);
  const chars=Object.values(ASSETS.char||{}).filter(Boolean);
  const list=[...bg,...chars];
  let done=0;
  const total=list.length||1;
  setBoot(0,'正在接收信号…');
  const tasks=list.map(src=>preloadImage(src).then(ok=>{done++;setBoot(done/total*90,'正在校准图像 '+done+' / '+list.length);return ok;}));
  // opening video metadata / poster; don't block on full download
  const v=$('#openingVideo');if(v&&ASSETS.video&&ASSETS.video.opening){v.poster=bgFor('title')||'';v.preload='metadata';}
  const tv=$('#titleVideo');if(tv&&ASSETS.video&&ASSETS.video.opening)tv.poster=bgFor('title')||'';
  await Promise.all(tasks);
  if(ASSETS.video&&ASSETS.video.opening)await preloadVideoMeta(ASSETS.video.opening);
  setBoot(100,'信号已锁定');
  const el=$('#bootScreen');
  setTimeout(()=>{
    el.classList.add('ready');
    bind();initTitle();
    $('#openingLayer').classList.remove('show');
    if(!Object.keys(ASSETS.bg||{}).length)toast('未找到素材清单，请先运行 tools/build_manifest.py',4000);
    AUDIO.startMusic('menu');
    window.__ECHO_READY=true;
  },320);
}
boot();
})();
