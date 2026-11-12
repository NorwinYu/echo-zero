import json,urllib.request,time,subprocess,os,tempfile
from pathlib import Path
from PIL import Image
BASE=os.environ.get('H3_URL','http://127.0.0.1:8190')
COMFY=os.environ.get('COMFY_URL','http://127.0.0.1:8189')
OUT=Path('assets/generated/video');OUT.mkdir(parents=True,exist_ok=True)
def upload(src,name):
 png=Path(tempfile.gettempdir())/(name+'.png');Image.open(src).convert('RGB').save(png)
 r=subprocess.run(['curl','-sS','-m','30','-X','POST',COMFY+'/upload/image','-F',f'image=@{png}','-F','overwrite=true'],capture_output=True,text=True)
 print('upload',r.stdout.strip(),flush=True)
 return json.loads(r.stdout)['name']
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
jobs=[
 ('opening','assets/generated/bg/title.webp',"Animate this exact sci-fi key art: slow cinematic camera drift around the orbital ring city, rain streaks falling, clouds moving, tiny window lights flickering, volumetric sun rays, film grain, no text, no extra objects, no people added."),
 ('ending','assets/generated/bg/broadcast.webp',"Animate this exact scene: dawn light slowly grows over the orbital city and radio tower array, rain clears, fine particles drift, very slow push-in, cinematic, no text, no extra objects, no people added."),
]
for key,src,prompt in jobs:
 dest=OUT/f'{key}.mp4'
 if dest.exists():print('skip',key,flush=True);continue
 print('GEN',key,flush=True)
 try:ref=upload(src,'echo_'+key)
 except Exception as e:print('upload err',e,flush=True);continue
 for a in range(8):
  try:
   time.sleep(3);r=post({'kind':'video','prompt':prompt,'seed':330000+len(key)*7,'frames':73,'steps':8,'prefix':'tk_ez_'+key,'refs':[ref]});print('job',r,flush=True);j=wait(r['job_id']);print('res',j,flush=True)
   if j and j.get('status')=='done' and j.get('files'):
    dest.write_bytes(urllib.request.urlopen(BASE+'/files/'+j['files'][0],timeout=120).read());print('saved',dest,dest.stat().st_size,flush=True);break
  except Exception as e:print('err',e,flush=True);time.sleep(15)
