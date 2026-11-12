#!/usr/bin/env python3
"""Scan generated assets and write assets/manifest.js (paths for static hosting)."""
import json
from pathlib import Path
ROOT=Path('.')
BG=ROOT/'assets/generated/bg'
CH=ROOT/'assets/generated/char'
VID=ROOT/'assets/generated/video'
VO=ROOT/'assets/generated/audio/voice'
MU=ROOT/'assets/generated/audio/music'
def files(p,exts):
    if not p.exists(): return {}
    return {f.stem:f.relative_to(ROOT).as_posix() for f in sorted(p.iterdir()) if f.suffix.lower() in exts}
man={
 'bg':files(BG,{'.webp','.jpg','.png'}),
 'char':files(CH,{'.webp','.png'}),
 'video':files(VID,{'.mp4','.webm'}),
 'voice':files(VO,{'.wav','.mp3','.m4a','.ogg'}),
 'music':files(MU,{'.mp3','.wav','.ogg'}),
 'meta':{'title':'零号信标','version':'1.0.0','license':'CC BY-NC 4.0'}
}
out=ROOT/'assets/manifest.js'
out.write_text('window.AI_ASSETS = '+json.dumps(man,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('manifest',out.stat().st_size,'bytes', {k:len(v) for k,v in man.items() if isinstance(v,dict)})
