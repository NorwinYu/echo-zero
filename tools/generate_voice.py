import json,subprocess,os,time
from pathlib import Path
OUT=Path('assets/generated/audio/voice');OUT.mkdir(parents=True,exist_ok=True)
EDGE=os.environ.get('EDGE_TTS','edge-tts')
# 更拟人的神经语音：Edge TTS 中文多角色声线。
VOICES={
 'narrator':('zh-CN-YunyangNeural','-4%','-4Hz'),
 'lin':('zh-CN-YunxiNeural','-3%','-6Hz'),
 'xian':('zh-CN-XiaoxiaoNeural','-10%','+4Hz'),
 'shen':('zh-TW-HsiaoChenNeural','-5%','-12Hz'),
 'system':('zh-CN-YunjianNeural','-2%','-10Hz'),
 'linxi':('zh-CN-XiaoyiNeural','-9%','+5Hz'),
}
js=r'''
const fs=require('fs'),vm=require('vm');
let src=fs.readFileSync('js/story.js','utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(src,ctx);
const S=ctx.window.STORY;const out=[];
for(const [sid,sc] of Object.entries(S.scenes)) for(const l of (sc.lines||[])) out.push({id:l.id,sp:l.sp,text:l.text,scene:sid});
console.log(JSON.stringify(out));
'''
lines=json.loads(subprocess.check_output(['node','-e',js],text=True))
for l in lines:
 dest=OUT/f"{l['id']}.mp3"
 if dest.exists():continue
 voice,rate,pitch=VOICES.get(l['sp'],VOICES['narrator'])
 text=l['text'].replace('——','，').replace('「','').replace('」','').replace('……','…')
 ok=False
 for a in range(3):
  try:
   subprocess.run([EDGE,'--voice',voice,'--rate='+rate,'--pitch='+pitch,'--text',text,'--write-media',str(dest)],check=True,timeout=60,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
   if dest.exists() and dest.stat().st_size>500: ok=True;break
  except Exception as e:
   time.sleep(2)
 if ok:print('ok',l['id'],l['sp'],flush=True)
 else:print('ERR',l['id'],flush=True)
# 清掉旧版 macOS say 生成的 WAV，避免重复/体积
for f in OUT.glob('*.wav'):
 f.unlink(missing_ok=True)
