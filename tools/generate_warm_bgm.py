import json,urllib.request,time,os
from pathlib import Path
BASE=os.environ.get('H3_URL','http://127.0.0.1:8190');OUT=Path('assets/generated/audio/music');OUT.mkdir(parents=True,exist_ok=True)
TRACKS={
 'theme':("Warm cinematic sci-fi ambient, 70 BPM, C major, soft felt piano, warm analog pads, gentle strings, hopeful melancholy, intimate and calm, no horror, no dissonance, no harsh percussion, instrumental",30),
 'descent':("Gentle mysterious sci-fi descent, 65 BPM, A minor, soft low pulse, warm synth pad, distant rain, curious and spacious, not scary, no horror, no dissonance, no harsh hits, instrumental",30),
 'tower':("Calm elegant sci-fi archive, 60 BPM, F major, glassy warm pads, soft piano, gentle strings, spacious and quiet, no horror, no tension, no dissonance, instrumental",26),
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
 dest=OUT/f'{key}.mp3'; tmp=OUT/f'_{key}.new.mp3'
 print('GEN',key,flush=True)
 try:
  r=post({'kind':'audio','caption':caption,'lyrics':'[Instrumental]','seconds':seconds,'seed':880000+len(key)*23,'cfg':1.7,'top_k':50,'steps':30,'prefix':'tk_ez_warm_'+key});j=wait(r['job_id']);print(j,flush=True)
  if j and j.get('status')=='done' and j.get('files'):
   tmp.write_bytes(urllib.request.urlopen(BASE+'/files/'+j['files'][0],timeout=120).read());tmp.replace(dest);print('saved',dest,dest.stat().st_size,flush=True)
 except Exception as e:print('ERR',e,flush=True);time.sleep(5)
