import json,urllib.request,time,io,hashlib,os
from pathlib import Path
from PIL import Image,ImageOps,ImageFilter
import numpy as np
BASE=os.environ.get('H3_URL','http://127.0.0.1:8190')
BG=Path('assets/generated/bg'); CH=Path('assets/generated/char'); BG.mkdir(parents=True,exist_ok=True); CH.mkdir(parents=True,exist_ok=True)
BGS={
 'title':"Cinematic sci-fi key art, a ring-shaped orbital city above a drowned Earth, teal and amber palette, rain and volumetric light, a tiny silhouette of a man at a window, film grain, anamorphic lens, no text, no logo, 16:9",
 'archive':"Dark futuristic signal archive control room, rows of old monitors, holographic waveforms, cyan and amber light, rain on glass, cinematic, no people, no text, 16:9",
 'descent':"A small dropship descending through storm clouds toward a flooded neon city, black water, teal and amber lights, cinematic, no people, no text, 16:9",
 'tidal':"Flooded futuristic city street at night, black water, dead neon signs, heavy rain, distant tower, cinematic, no people, no text, 16:9",
 'core':"Vast spherical memory core chamber, floating data fragments, cyan light, shallow water, cables, cinematic, no people, no text, 16:9",
 'tower':"White minimalist council tower interior, huge window overlooking an orbital ring, cold light, amber accents, cinematic, no people, no text, 16:9",
 'broadcast':"Dawn over an orbital city, radio tower array, teal sky, amber sun, rain clearing, cinematic, no people, no text, 16:9",
 'silence':"Dark orbital hangar, a small shuttle, distant city lights, moody teal and amber, cinematic, no people, no text, 16:9",
}
CHARS={
 'lin':"Cinematic half-body character portrait of a Chinese man, 28, signal archivist, short black hair, tired eyes, dark teal technical jacket with cyan accents, facing camera, isolated on a perfectly flat solid pure green background, no shadow, no ground, no text",
 'lin_shaken':"Cinematic half-body character portrait of the same Chinese man, 28, signal archivist, short black hair, rain on his face, shaken expression, dark teal technical jacket with cyan accents, facing camera, isolated on a perfectly flat solid pure green background, no shadow, no ground, no text",
 'xian':"Cinematic half-body portrait of a holographic female AI, translucent cyan skin, short white hair, glowing particles, gentle sad expression, futuristic collar, facing camera, isolated on a perfectly flat solid pure green background, no shadow, no ground, no text",
 'xian_sad':"Cinematic half-body portrait of a holographic female AI, translucent cyan skin, short white hair, glitching particles, deeply sad expression, futuristic collar, facing camera, isolated on a perfectly flat solid pure green background, no shadow, no ground, no text",
 'shen':"Cinematic half-body portrait of a Chinese female salvage captain, 34, short wet hair, small scar on cheek, dark orange jacket, stern expression, facing camera, isolated on a perfectly flat solid pure green background, no shadow, no ground, no text",
}
def post(p,d):
 r=urllib.request.Request(BASE+p,data=json.dumps(d).encode(),headers={'Content-Type':'application/json'});return json.loads(urllib.request.urlopen(r,timeout=30).read())
def get(p):return json.loads(urllib.request.urlopen(BASE+p,timeout=30).read())
def wait(jid):
 for i in range(180):
  time.sleep(2)
  try:j=get('/jobs/'+jid)
  except Exception:continue
  if j.get('status') in ('done','error','failed'):return j
 return None
def gen(prompt,preset,prefix,seed):
 for a in range(10):
  try:
   time.sleep(2)
   r=post('/generate',{'kind':'image','prompt':prompt,'preset':preset,'seed':seed,'prefix':prefix});j=wait(r['job_id'])
   if j and j.get('status')=='done' and j.get('files'):
    return urllib.request.urlopen(BASE+'/files/'+j['files'][0],timeout=90).read()
  except Exception as e:print(' err',e,flush=True);time.sleep(15)
 return None
for k,p in BGS.items():
 dest=BG/f'{k}.webp'
 if dest.exists():print('skip bg',k,flush=True);continue
 print('GEN bg',k,flush=True);data=gen(p,'2k','tk_ez_bg_'+k,110000+int(hashlib.md5(k.encode()).hexdigest()[:5],16)%9999)
 if data:
  im=Image.open(io.BytesIO(data)).convert('RGB');im=ImageOps.fit(im,(2048,1152),method=Image.LANCZOS);im.save(dest,'WEBP',quality=88,method=6);print(' saved',dest,flush=True);time.sleep(8)
for k,p in CHARS.items():
 dest=CH/f'{k}.webp'
 if dest.exists():print('skip char',k,flush=True);continue
 print('GEN char',k,flush=True);data=gen(p,'portrait','tk_ez_char_'+k,120000+int(hashlib.md5(k.encode()).hexdigest()[:5],16)%9999)
 if data:
  im=Image.open(io.BytesIO(data)).convert('RGB');a=np.array(im).astype(np.int16);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
  mask=((g>90)&(g>r*1.35)&(g>b*1.35)).astype(np.uint8)*255
  alpha=Image.fromarray(255-mask).filter(ImageFilter.GaussianBlur(.6));arr=np.array(im).astype(np.uint8);al=np.array(alpha);edge=(al>0)&(al<250)
  arr[:,:,1]=np.where(edge,np.minimum(arr[:,:,1],np.maximum(arr[:,:,0],arr[:,:,2])),arr[:,:,1])
  out=Image.fromarray(arr).convert('RGBA');out.putalpha(alpha);out=out.crop(out.getbbox());out.thumbnail((640,1200),Image.LANCZOS);out.save(dest,'WEBP',quality=90,method=6);print(' saved',dest,out.size,flush=True);time.sleep(8)
