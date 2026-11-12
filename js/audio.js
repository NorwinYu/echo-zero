/* 零号信标 · 原创程序化音乐 / 音效 / 语音播放
   非商业 Demo；所有音乐由 WebAudio 实时合成，无第三方采样。 */
(function(){
'use strict';
const AUDIO = (()=>{
  let ctx=null, master=null, musicBus=null, voiceBus=null, sfxBus=null;
  let musicTimer=null, musicNodes=[], mode=null, voiceEl=null, enabled=false, bgmEl=null, bgmFade=null;
  const settings={music:.16,voice:.95,sfx:.55};
  const chords={
    menu:[[146.83,174.61,220,261.63],[130.81,164.81,196,246.94],[116.54,146.83,174.61,220],[110,138.59,164.81,220]],
    archive:[[146.83,174.61,220,293.66],[130.81,164.81,196,246.94],[116.54,146.83,174.61,220],[110,138.59,164.81,207.65]],
    descent:[[110,130.81,164.81,196],[98,123.47,146.83,185],[87.31,110,130.81,164.81],[82.41,103.83,123.47,155.56]],
    tower:[[130.81,155.56,196,233.08],[123.47,146.83,185,220],[116.54,138.59,174.61,207.65],[110,130.81,164.81,196]],
    ending:[[174.61,220,261.63,329.63],[164.81,207.65,246.94,311.13],[146.83,185,220,277.18],[130.81,164.81,196,246.94]],
    silence:[[110,138.59,164.81],[98,123.47,146.83],[87.31,110,130.81],[82.41,103.83,123.47]]
  };
  function init(){
    if(ctx) return;
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    ctx=new AC(); master=ctx.createGain(); master.gain.value=.9; master.connect(ctx.destination);
    musicBus=ctx.createGain(); musicBus.gain.value=settings.music; musicBus.connect(master);
    voiceBus=ctx.createGain(); voiceBus.gain.value=settings.voice; voiceBus.connect(master);
    sfxBus=ctx.createGain(); sfxBus.gain.value=settings.sfx; sfxBus.connect(master);
    enabled=true;
  }
  function resume(){ init(); if(ctx&&ctx.state==='suspended') ctx.resume(); if(bgmEl&&bgmEl.paused) bgmEl.play().catch(()=>{}); }
  function tone(freq,dur,type='sine',vol=.08,when=0,bus=musicBus,filter=1200){
    if(!ctx) return;
    const t=ctx.currentTime+when; const o=ctx.createOscillator(), g=ctx.createGain(), f=ctx.createBiquadFilter();
    o.type=type; o.frequency.value=freq; f.type='lowpass'; f.frequency.value=filter;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.08); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t+dur+.05); musicNodes.push(o);
  }
  function noise(dur=.25,vol=.05,when=0){
    if(!ctx) return;
    const len=Math.max(1,Math.floor(ctx.sampleRate*dur)); const buf=ctx.createBuffer(1,len,ctx.sampleRate); const d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
    const s=ctx.createBufferSource(); s.buffer=buf; const g=ctx.createGain(); g.gain.value=vol; s.connect(g); g.connect(sfxBus); s.start(ctx.currentTime+when);
  }
  function startMusic(next){
    if(next===mode&&(musicTimer||bgmEl)){ if(bgmEl&&bgmEl.paused) bgmEl.play().catch(()=>{}); return; } stopMusic(); mode=next;
    const files=window.AI_ASSETS&&window.AI_ASSETS.music||{};
    const src=files[next]||((next==='menu'||next==='archive')?files.theme:null)||(next==='silence'?files.ending:null);
    if(src&&!settings.reduceMotion){
      bgmEl=new Audio(src); bgmEl.loop=true; bgmEl.volume=0;
      bgmEl.play().catch(()=>{});
      const target=settings.music*(next==='silence'?.55:1); let v=0;
      clearInterval(bgmFade); bgmFade=setInterval(()=>{ if(!bgmEl){clearInterval(bgmFade);return;} v=Math.min(target,v+.025); bgmEl.volume=v; if(v>=target)clearInterval(bgmFade); },50);
      return;
    }
    if(!ctx||!enabled) return;
    const seq=chords[next]||chords.menu; let i=0;
    const play=()=>{
      const ch=seq[i%seq.length]; i++;
      ch.forEach((f,j)=>tone(f,7.5,j===0?'sine':'triangle',.028/(j*.4+1),0,musicBus,900));
      tone(ch[0]/2,6,'sine',.035,0,musicBus,400);
      if(next==='descent'||next==='tower'){ tone(ch[2]*2,1.2,'triangle',.018,.2,musicBus,1400); tone(ch[1]*2,1.1,'triangle',.014,1.4,musicBus,1400); }
      if(next==='ending'){ [0,1,2,3].forEach(k=>tone(ch[k%4]*2,2.2,'sine',.012,k*.35,musicBus,1800)); }
    };
    play(); musicTimer=setInterval(play,7200);
  }
  function stopMusic(){
    if(musicTimer){ clearInterval(musicTimer); musicTimer=null; }
    clearInterval(bgmFade); bgmFade=null;
    if(bgmEl){ try{bgmEl.pause();bgmEl.currentTime=0;}catch(e){} bgmEl=null; }
    musicNodes.forEach(n=>{try{n.stop()}catch(e){}}); musicNodes=[]; mode=null;
  }
  function sfx(name){
    if(!ctx) return;
    if(name==='ui'){ tone(880,.08,'sine',.035,0,sfxBus,3000); }
    else if(name==='alert'){ tone(220,.18,'square',.04,0,sfxBus,1200); tone(330,.18,'square',.03,.12,sfxBus,1200); }
    else if(name==='scan'){ tone(440,.8,'sine',.035,0,sfxBus,2200); tone(660,.8,'sine',.02,.1,sfxBus,2200); }
    else if(name==='heart'){ tone(55,.4,'sine',.09,0,sfxBus,300); tone(50,.5,'sine',.06,.18,sfxBus,300); }
    else if(name==='power'){ tone(110,.9,'sawtooth',.04,0,sfxBus,700); tone(220,1.1,'sine',.03,.1,sfxBus,1600); }
    else if(name==='glitch'){ noise(.15,.04); tone(120,.12,'square',.025,0,sfxBus,800); }
    else if(name==='rain'){ noise(1.4,.012); }
  }
  function setVolume(k,v){ settings[k]=v; if(bgmEl&&k==='music') bgmEl.volume=v; if(!ctx) return; if(k==='music') musicBus.gain.value=v; if(k==='voice') voiceBus.gain.value=v; if(k==='sfx') sfxBus.gain.value=v; }
  function playVoice(src){
    stopVoice(); if(!src) return Promise.resolve();
    voiceEl=new Audio(src); voiceEl.volume=settings.voice;
    return new Promise(res=>{ voiceEl.onended=()=>res(); voiceEl.onerror=()=>res(); voiceEl.play().catch(()=>res()); });
  }
  function stopVoice(){ if(voiceEl){ try{voiceEl.pause();voiceEl.currentTime=0;}catch(e){} voiceEl=null; } duck(false); }
  function duck(on){ if(bgmEl) bgmEl.volume=on?settings.music*.35:settings.music; if(musicBus&&ctx) musicBus.gain.setTargetAtTime(on?settings.music*.35:settings.music,ctx.currentTime,.2); }
  return { init,resume,startMusic,stopMusic,sfx,setVolume,playVoice,stopVoice,duck,get ready(){return !!ctx;} };
})();
window.AUDIO=AUDIO;
})();
