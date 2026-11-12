# 音频生成调研与实现

> 这个 Demo 的音频部分不是“假装有配音”。  
> 下面记录了实际尝试过的 ComfyUI 音频节点、失败原因、最终采用的方案，以及后续替换路径。

---

## 1. 目标

- 143 句中文剧情配音，多角色声线
- 3～5 段情绪不同的配乐
- UI / 警报 / 扫描 / 心跳 / 电源 / 故障等音效
- 全部原创 / 合成，不使用任何商业音乐、影视原声或现有作品台词
- 浏览器直接播放，无后端

---

## 2. 调研：ComfyUI 里有什么

对 ComfyUI 的节点清单做了扫描，相关节点包括：

- **Breeze TTS 2**：`BreezeVoiceSelector` + `BreezeTextToSpeech` + `BreezeVoiceDesign`
- **Fish Audio TTS**：`FishAudioVoiceSelector` + `FishAudioTextToSpeech`
- **MiniMax Music 3**：`MiniMaxMusic3TextEncode` + `EmptyMiniMaxMusic3LatentAudio` + `VAEDecodeAudio`
- **Sonilo**：`SoniloTextToMusic`
- **Pika Music**：`PikaMusicNode`
- **ElevenLabs**：`ElevenLabsTextToSpeech`
- **HeyGen**：`HeyGenTextToSpeechNode`
- 以及 `SaveAudioMP3`、`SaveAudioAdvanced`、`AudioConcat` 等工具节点

---

## 3. 测试结果

### 3.1 Breeze TTS 2

工作流：

```text
BreezeVoiceSelector (Chinese / 晨曦讲解员)
  → BreezeTextToSpeech (text, delivery=neutral)
  → SaveAudioMP3
```

结果：

```text
Unauthorized: Please login first to use this node.
```

Breeze 节点属于 Comfy.org API 节点，需要登录态，不是离线节点。

### 3.2 Fish Audio TTS

工作流：

```text
FishAudioVoiceSelector (Gentle Female (zh))
  → FishAudioTextToSpeech (s2.1-pro)
  → SaveAudioMP3
```

结果相同：

```text
Unauthorized: Please login first to use this node.
```

### 3.3 MiniMax Music 3

ComfyUI 内置节点中没有可直接使用的 Music3 模型：

- `minimax_music3_dit_*`
- `minimax_music3_text_encoder_*`
- `minimax_music3_dav.safetensors`

`UNETLoader` 只列出了 H3 的图像/视频模型，没有 Music 3 diffusion model。  
要直接跑 ComfyUI 的 Music3，需要额外下载数 GB 模型，并配置 text encoder / audio VAE。

**但 H3 音频接口已经支持 `kind:audio`**，底层是 MiniMax Music3；本 Demo 已通过该接口生成 4 段 BGM，无需在本地部署模型。

参考：

- [ComfyUI Empty MiniMax Music3 Latent Audio](https://docs.comfy.org/built-in-nodes/EmptyMiniMaxMusic3LatentAudio)
- [MiniMax Music 3 workflow 示例](https://huggingface.co/rzgar/minimax_music3_text_encoder_fp16_fp8/raw/main/workflow/minimax_music3_workflow_default.json)
- [FL MiniMax Music 3 节点](https://github.com/filliptm/ComfyUI-FL-MiniMaxMusic3)

### 3.4 Sonilo / Pika / ElevenLabs / HeyGen

这些也是 API 节点，需要 Comfy.org / 第三方登录或 API Key；本 Demo 未使用。

---

## 4. 最终方案

### 4.1 配音：Edge 神经 TTS（最终采用）

在 Breeze / Fish 需要登录、Music 3 模型缺失的情况下，改用 **Microsoft Edge 神经 TTS**：

- 生成时在线调用 Edge 神经语音；**运行时完全离线**，音频已保存为 MP3
- 多角色声线：
  - 旁白：`zh-CN-YunyangNeural`（沉稳男声）
  - 林澈：`zh-CN-YunxiNeural`（年轻男声，略降调）
  - 弦：`zh-CN-XiaoxiaoNeural`（温暖、略慢、升调）
  - 沈岚：`zh-TW-HsiaoChenNeural`（成熟、降调、台湾腔，明显区分）
  - 系统 / 档案馆：`zh-CN-YunjianNeural`（冷静男声）
  - 林汐：`zh-CN-XiaoyiNeural`（柔和、轻、略升调）
- 每角色单独设置 `rate` / `pitch`，避免“一个机器声读全剧”
- 输出：`assets/generated/audio/voice/v001.mp3` … `v143.mp3`
- 由 `tools/generate_voice.py` 从 `js/story.js` 自动提取台词生成
- 143 句总大小约 **3.8 MB**，比 WAV 小很多

优点：

- 比 macOS `say` 明显更自然；弦 / 沈岚 / 林汐使用不同声线，避免“两个女生同一个声音”
- 有中文韵律、停顿和语气
- 生成一次，运行时无网络
- 无第三方音乐/语音采样

限制：

- 生成时需要网络
- 不是可商用的配音演员；仅用于非商业 Demo
- 不提供逐句情感标签（Edge CLI 只支持 rate / pitch）

### 4.2 BGM：MiniMax Music3（H3 音频接口）

H3 音频接口支持 `kind: audio`，模型为 **MiniMax Music3**。已生成 4 段 30 秒循环 BGM：

- `theme`：主题 / 档案室
- `descent`：下潜 / 紧张
- `tower`：白塔档案馆 / 冷峻
- `ending`：结局 / 温暖

参数：`caption` + `[Instrumental]` 歌词 + `seconds=30` + `steps=30` + `cfg=1.7`。

- 生成时通过 H3 音频接口完成；运行时只播放已保存的 MP3，不联网
- 播放：`js/audio.js` 用 `<audio loop>` 播放，按场景切换
- 若文件缺失，回退到 WebAudio 程序化音乐
- 全部为原创生成，无第三方采样

### 4.3 音效：WebAudio 原创合成

- `js/audio.js` 中用 Oscillator / Gain / BiquadFilter / Noise 实时合成
- `ui` / `alert` / `scan` / `heart` / `power` / `glitch` / `rain`
- 无外部采样

#### 音效清单

- `ui`：短促高频点击
- `alert`：双音警报
- `scan`：扫描扫频
- `heart`：低频心跳
- `power`：电源启动
- `glitch`：噪声 + 方波故障
- `rain`：噪声雨声

### 4.4 浏览器播放策略

- **首次触摸 / 点击**：初始化并 `resume()` AudioContext，同时重试 BGM 播放；这是移动浏览器的自动播放限制。
- **语音改为 WebAudio**：`fetch` MP3 → `decodeAudioData` → `AudioBufferSourceNode` 播放，不再依赖每句 `new Audio()` 的自动播放权限，避免 iOS 上 BGM 有声音、对白没声音。
- **预加载**：开始新游戏时预加载第一句；每句渲染时预加载下一句；已解码语音做 8 条 LRU 缓存。
- **BGM**：仍用 `<audio loop>`，首次交互后播放；音量默认 16%，对白播放时自动 duck。
- **微信内置浏览器**：监听 `WeixinJSBridgeReady` 并支持首次触摸解锁。
- **静音开关**：iPhone 侧边静音键会静音网页音频，代码无法绕过，需要在系统层关闭静音。

---

## 5. 如何替换配音

### 5.1 使用 Breeze TTS（需要 Comfy.org 登录，音色更可控）

1. 在 ComfyUI 中登录 Comfy.org 账号。
2. 用 `BreezeVoiceSelector` 选中文声线。
3. 用 `BreezeTextToSpeech` 生成。
4. `SaveAudioMP3` 输出。
5. 把文件放到 `assets/generated/audio/voice/`，保持文件名 `v001.mp3` 等。
6. 修改 `tools/build_manifest.py` 的扩展名白名单（已包含 `.mp3`）。
7. 重新运行：

```bash
python3 tools/build_manifest.py
```

### 5.2 使用 Fish Audio

类似，登录后使用 `FishAudioTextToSpeech`，输出 MP3/WAV。

### 5.3 使用 MiniMax Music 3

1. 下载模型：
   - `minimax_music3_dit_*`
   - `minimax_music3_text_encoder_*`
   - `minimax_music3_dav.safetensors`
2. 按官方 workflow 连接 `UNETLoader` / `CLIPLoader` / `VAELoader` / `MiniMaxMusic3TextEncode` / `EmptyMiniMaxMusic3LatentAudio` / `KSampler` / `VAEDecodeAudio`。
3. 生成 30～60 秒循环，放到 `assets/generated/audio/bgm/`。
4. 在 `js/audio.js` 中改为 `<audio>` 或 WebAudio buffer 播放。

### 5.4 真人配音

替换同名 WAV/MP3 即可；保持 `manifest` 重新生成。  
真人配音需自行取得授权，并遵守非商业许可。

---

## 6. 版权与合规

- 没有使用任何商业音乐、影视原声、游戏语音或现有作品台词。
- 故事、角色、文本均为原创。
- Edge TTS 输出与 WebAudio 合成均为本项目生成。
- 配音与音乐仅用于非商业 Demo。
- 若替换为第三方语音/音乐，请自行确认授权。

---

## 7. 文件结构

```text
assets/generated/audio/voice/
  v001.mp3
  ...
  v143.mp3

js/audio.js        # 程序化音乐 / 音效 / 语音播放
tools/generate_voice.py
```

---

## 8. 结论

- **图像/视频**：MiniMax H3 可用，已生成 8 张场景、5 张角色、2 段视频。
- **语音**：当前 H3 环境没有可用的离线神经 TTS；Breeze/Fish 需要登录，Music3 模型缺失。
- **本 Demo 选择**：Edge 神经 TTS（对白） + MiniMax Music3（H3 音频接口，BGM） + WebAudio（音效）；运行时完全离线。
- **后续升级**：登录 Comfy.org 使用 Breeze/Fish，或安装 MiniMax Music 3 模型。
