# AI 生成资产说明

> 本 Demo 的全部场景、角色、片头片尾均为 **MiniMax H3** 生成；  
> 代码、UI、程序化音乐由 **DeepSeek Flash** 辅助生成；  
> 中文配音为 Edge 神经 TTS（生成时在线，运行时不联网）。  
> 仅用于非商业技术 Demo。

---

## 1. 资产总览

| 类别 | 数量 | 目录 | 用途 |
|---|---:|---|---|
| 场景背景 | 8 | `assets/generated/bg/` | 标题 / 章节场景 |
| 角色立绘 | 5 | `assets/generated/char/` | 视觉小说角色站位 |
| 片头视频 | 1 | `assets/generated/video/opening.mp4` | 开场 |
| 片尾视频 | 1 | `assets/generated/video/ending.mp4` | 回声结局 |
| 中文配音 | 143 | `assets/generated/audio/voice/` | 全台词配音 |
| BGM | 4 | `assets/generated/audio/music/` | 场景循环配乐 |

### 场景

| id | 内容 |
|---|---|
| `title` | 轨道城市「栖霞环」主视觉 |
| `archive` | 第 47 层信号档案室 |
| `descent` | 穿梭机穿过风暴云层 |
| `tidal` | 潮汐城黑水街道 |
| `core` | 城市记忆核心 |
| `tower` | 白塔档案馆 |
| `broadcast` | 档案阵列 / 黎明 |
| `silence` | 静默机库 |

### 角色

| id | 角色 | 说明 |
|---|---|---|
| `lin` | 林澈 | 信号档案员，深青技术夹克 |
| `lin_shaken` | 林澈 | 震惊状态 |
| `xian` | 弦 | 全息城市智能，高领制服 |
| `xian_sad` | 弦 | 悲伤 / 故障状态 |
| `shen` | 沈岚 | 打捞船长，橙色夹克 |

> 全部角色均为成年虚构人物；立绘为完整服装，无露骨内容。

---

## 2. 生成方式

### 2.1 场景

- H3 text-to-image，`2k`（2048×1152）
- 统一风格：电影感、青绿 + 琥珀、雨、体积光、胶片颗粒、16:9
- 无人物、无文字、无 logo

### 2.2 角色

- H3 text-to-image，`portrait`
- 半身、正面、纯绿幕背景
- Pillow 色键抠图 + 去绿边
- 输出透明 WebP，约 640×1000
- `xian` 使用高领不透明制服提示词，确保覆盖肩胸

### 2.3 视频

- H3 image-to-video
- 3 秒，1344×768，24fps
- 片头：轨道城市缓慢推镜、雨、云、灯光
- 片尾：黎明、档案塔、雨停、粒子

### 2.4 配音

- Edge 神经 TTS，多角色声线
- 输出 MP3，143 句，约 3.8 MB
- BGM：局域网 MiniMax Music3 生成 4 段 30 秒 MP3
- 生成时在线，运行时不联网
- 详见 [AUDIO.md](AUDIO.md)

---

## 3. 提示词风格

### 场景

```text
Cinematic sci-fi [场景], teal and amber palette, rain, volumetric light,
film grain, anamorphic lens, no people, no text, 16:9
```

### 角色

```text
Cinematic half-body character portrait of [角色描述],
facing camera, isolated on a perfectly flat solid pure green background,
no shadow, no ground, no text
```

### 视频

```text
Animate this exact scene: [运镜/氛围],
no text, no extra objects, no people added.
```

---

## 4. 运行时加载

- `assets/manifest.js` 列出 bg / char / video / voice 路径
- 图片通过 `<img>` / CSS background 加载
- 视频通过 `<video>` 加载
- 语音通过 `<audio>` 播放
- 无 CORS 问题（同源路径）
- 无运行时 H3 调用

---

## 5. 重新生成

需要 H3 agent 服务：

```bash
export H3_URL=http://<your-h3-host>:8190
```

```bash
python3 tools/generate_assets.py    # 8 场景 + 5 角色
python3 tools/generate_voice.py     # 143 句配音
python3 tools/generate_music.py     # 4 段 BGM（H3 Music3）
python3 tools/generate_warm_bgm.py  # 温暖版 BGM（可选）
python3 tools/generate_videos.py    # 片头 + 片尾
python3 tools/build_manifest.py     # 重建 manifest
```

> `generate_videos.py` 使用 `COMFY_URL` 环境变量，默认 `http://127.0.0.1:8189`；如 ComfyUI 在别的机器，请设置 `COMFY_URL`。

---

## 6. 替换资产

### 场景

把同名 WebP 放到 `assets/generated/bg/<id>.webp`，重新运行 manifest。

### 角色

`assets/generated/char/<id>.webp`，透明背景，建议 640×1000。

### 视频

`assets/generated/video/opening.mp4` / `ending.mp4`，16:9，3 秒左右。

### 配音

`assets/generated/audio/voice/v001.mp3` 等同名文件；支持 `.mp3` / `.wav`。

---

## 7. 版权

- 生成素材：CC BY-NC 4.0
- 代码：MIT
- 故事 / 角色 / 文本：原创
- 非商业使用
- 无任何现有作品角色、剧情、音乐、语音
