import json,urllib.request,time,os
from pathlib import Path
BASE=os.environ.get('H3_URL','http://127.0.0.1:8190')
OUT=Path('assets/generated/audio/music');OUT.mkdir(parents=True,exist_ok=True)
TRACKS={
 'theme':("Cinematic sci-fi noir theme, 72 BPM, D minor, slow analog synth pads, low cello, distant rain, soft glassy arpeggio, melancholic, spacious, instrumental, no drums, no vocals",30),
 'descent':("Dark cinematic sci-fi descent, 60 BPM, low drone, pulsing sub bass, metallic hits, rain, tension, no melody, instrumental, no vocals",30),
 'tower':("Cold minimalist sci-fi archive, 65 BPM, glassy pads, sparse piano, soft strings, suspended chords, instrumental, no vocals",30),
 'ending':("Emotional cinematic sci-fi ending, 68 BPM, warm piano, strings, wordless female vocalise, hopeful melancholy, slow build, instrumental with wordless voice",30),
}
def post(d):
 r=urllib.request.Request(BASE+'/generate',data=json.dumps(d).encode(),headers={'Content-Type':'application/json'});return json.loads(urllib.request.urlopen(r,timeout=30).read())
def get(p):return json.loads(urllib.request.urlopen(BASE+p,timeout=30).read())
def wait(jid):
 for i in range(240):
  time.sleep(3)
  try:j=get('/jobs/'+jid)
  except Exception:continue
  if j.get('status') in ('done','error','failed'):return j
 return None
for key,(caption,seconds) in TRACKS.items():
 dest=OUT/f'{key}.mp3'
 if dest.exists():print('skip',key,flush=True);continue
 print('GEN',key,flush=True)
 try:
  r=post({'kind':'audio','caption':caption,'lyrics':'[Instrumental]','seconds':seconds,'seed':520000+len(key)*17,'cfg':1.7,'top_k':50,'steps':30,'prefix':'tk_ez_music_'+key});print('job',r,flush=True);j=wait(r['job_id']);print(j,flush=True)
  if j and j.get('status')=='done' and j.get('files'):
   dest.write_bytes(urllib.request.urlopen(BASE+'/files/'+j['files'][0],timeout=120).read());print('saved',dest,dest.stat().st_size,flush=True)
 except Exception as e:print('ERR',e,flush=True);time.sleep(5)
