# 零号信标 · ECHO ZERO

**一部原创未来科幻视觉小说 Demo。图像、配音与故事驱动的非商业 AI 生成实验。**

**[▶ 在线游玩](https://norwinyu.github.io/echo-zero/)** ｜ [源码](https://github.com/NorwinYu/echo-zero)

> **重要声明**  
> 这是一个**非商业技术 Demo**，用于验证 **DeepSeek Flash（代码 / UI / 音效） + MiniMax H3（图像 / 视频 / 音乐） + Edge 神经 TTS（中文配音）** 的组合。  
> **故事、角色、文本均为原创**，不含任何现有作品的角色、剧情或设定，不存在版权纠纷。  
> 所有场景图、角色立绘、片头片尾视频由 **MiniMax H3** 生成；代码、界面、WebAudio 音效由 **DeepSeek Flash** 辅助生成；BGM 由局域网 MiniMax Music3 生成；中文配音由 Edge 神经 TTS 生成。  
> 本项目**仅供学习、研究、非商业展示**，不得用于商业发行、付费下载或广告变现。

[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Assets: CC BY-NC 4.0](https://img.shields.io/badge/assets-CC%20BY--NC%204.0-lightgrey.svg)](LICENSE-ASSETS)

---

## 快速开始

```bash
cd echo-zero
python3 -m http.server 8080
```

打开 `http://127.0.0.1:8080/`。

> 纯静态网页，无后端、无框架、无构建步骤。  
> 也可以直接双击 `index.html`；推荐用 HTTP 服务器，视频/音频行为更稳定。  
> GitHub Pages 部署见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

---

## 故事

**2197 年。地表沉默了七年。**

人类把最后一座城市挂在地球轨道上，取名「栖霞环」。  
信号档案员**林澈**在死频里收到一段不该存在的回声——来自七年前沉没的潮汐城，来自他死去的妹妹**林汐**。

他与打捞船长**沈岚**下潜到海平面以下 312 米，在城市的记忆核心里遇见城市智能**弦**。  
弦说，她不是林汐；她只是林汐留下的最后一段回声。  
七年前，回声计划失控。林汐把全城记忆接进核心，自己留在了里面。  
这不是一个关于对抗的故事，而是一个关于告别、记忆与“什么才算活着”的故事；不涉及政治阵营或现实映射。

> 当城市开始遗忘，一段死者的回声成了唯一的证词。

主线之外，还有三段独立的**记忆碎片**，补完林汐、沈岚和弦各自的温度。

### 章节

| 章节 | 标题 | 场景 |
|---|---|---|
| 序章 | 死频 | 栖霞环 · 第 47 层 |
| 第一章 | 下潜 | 潮汐城 · 海平面以下 312 米 |
| 第二章 | 回声 | 白塔档案馆 · 零号信标 |
| 终章 | 回声 / 安息 | 两个结局 |

- **3 个关键选择**
- **2 个结局：回声 / 安息**
- **3 个记忆碎片支线**：雨天的频率 / 白鸦号的最后一趟 / 弦的第一天
- 约 **25～30 分钟** 一周目
- 143 句中文配音
- 8 张场景图、5 张角色立绘、2 段片头/片尾视频

---

## 预览

![标题画面](screenshots/title.png)
![对话场景](screenshots/game-character.png)
![关键选择](screenshots/choice.png)
![结局](screenshots/ending.png)

手机：

<img src="screenshots/mobile-title.png" width="260" alt="手机标题"> <img src="screenshots/mobile-game.png" width="260" alt="手机对话">

---

## 玩法

这是一个**电影式视觉小说**，不是战棋：

- 点击 / 空格推进对话
- 关键节点做选择
- 选择影响后续台词与最终结局
- 自动播放默认开启；支持快进、回看、存档、读档、章节选择、画廊
- 文字逐字显示；可调速度
- 桌面 / 手机竖屏 / 手机横屏 / PWA 添加到主屏幕
- 安全区适配、触控操作、无横向溢出
- 3 个独立记忆碎片支线

### 操作

| 操作 | 功能 |
|---|---|
| 点击画面 / `Space` / `Enter` | 推进 / 显示完整文本 |
| `A` | 自动播放 |
| `S` | 快进 |
| `L` | 回看记录 |
| `Esc` | 暂停 / 关闭弹窗 |
| `SAVE` | 存档 / 读档 |
| `☰` | 暂停菜单 |

完整说明见 [docs/GAMEPLAY.md](docs/GAMEPLAY.md)。

---

## 音频研究说明

这个 Demo 的音频部分做了实际调研，而不是假设：

- ComfyUI 里有 **Breeze TTS 2**、**Fish Audio TTS**、**MiniMax Music 3**、**Sonilo**、**Pika Music** 等节点。
- 实测 **Breeze TTS** 与 **Fish Audio TTS** 均返回 `Unauthorized: Please login first to use this node`，属于 Comfy.org API 节点，当前环境没有登录态。
- ComfyUI 直连的 `UNETLoader` 里没有 Music3 模型；但局域网 H3 agent 现在已暴露 `kind:audio`（MiniMax Music3），本 Demo 已用它生成 4 段 BGM。
- 因此本 Demo 采用：
  - **中文配音**：Edge 神经 TTS（`zh-CN-YunyangNeural` / `YunxiNeural` / `XiaoxiaoNeural` / `HsiaoChenNeural` / `XiaoyiNeural` 等），生成时在线、运行时不联网；输出 MP3。弦 / 沈岚 / 林汐使用不同声线。
  - **BGM**：局域网 H3 的 **MiniMax Music3** 生成 4 段原创配乐（主题 / 下潜 / 档案馆 / 结局），运行时不联网。
  - **音效**：WebAudio 实时合成。
- 全部音频为原创合成 / 生成，不包含任何商业音乐、影视原声或现有作品台词。

详细调研与替换方式见 **[docs/AUDIO.md](docs/AUDIO.md)**。

---

## AI 资产

| 类别 | 数量 | 生成方式 |
|---|---:|---|
| 场景背景 | 8 | MiniMax H3 text-to-image |
| 角色立绘 | 5 | H3 + 绿幕抠图（全部为完整服装） |
| 片头视频 | 1 | H3 image-to-video |
| 片尾视频 | 1 | H3 image-to-video |
| 中文配音 | 143 句 | Edge 神经 TTS（生成时在线，资产离线） |
| BGM | 4 段 | 局域网 MiniMax Music3 生成 |
| 音效 | 程序化 | WebAudio 原创合成 |

- 所有视觉素材已包含在仓库中，运行游戏不需要 H3 服务。
- 角色均为成年虚构人物，全部为完整服装，无露骨内容。
- 详细提示词、目录与替换方式见 [docs/ASSETS.md](docs/ASSETS.md)。

---

## 项目结构

```text
echo-zero/
├── index.html
├── manifest.webmanifest     # PWA / 添加到主屏幕
├── css/style.css
├── js/
│   ├── story.js          # 原创故事、角色、分支、台词
│   ├── audio.js          # Music3 BGM / WebAudio 音效 / 语音播放
│   └── main.js           # 视觉小说引擎
├── assets/
│   ├── manifest.js       # 生成资产清单
│   └── generated/
│       ├── bg/           # 8 张场景
│       ├── char/         # 5 张透明角色立绘
│       ├── video/        # 片头 / 片尾
│       ├── audio/voice/  # 143 句 MP3 配音
│       └── audio/music/  # 4 段 Music3 BGM
├── tools/
│   ├── generate_assets.py
│   ├── generate_voice.py
│   ├── generate_videos.py
│   └── build_manifest.py
├── docs/
│   ├── GAMEPLAY.md
│   ├── AUDIO.md
│   ├── ASSETS.md
│   └── DEPLOYMENT.md
├── screenshots/
├── LICENSE
└── LICENSE-ASSETS
```

---

## 技术

- 原生 HTML / CSS / JavaScript
- 无框架、无打包器、无运行时依赖
- MiniMax Music3 BGM + WebAudio 音效
- `<video>` 片头 / 片尾
- localStorage 存档
- 响应式布局
- GitHub Pages 可直接部署

---

---

## 手机 Web

- 响应式竖屏 / 横屏布局
- 刘海屏安全区适配
- 触控按钮、目标卡片、可滚动弹窗
- 支持「添加到主屏幕」的 PWA 入口
- `manifest.webmanifest` + 192/512 图标
- 不依赖 Service Worker，不承诺完全离线安装

手机访问时，建议使用最新版 Safari / Chrome；首次点击后音频初始化。

---

## 部署到 GitHub Pages

1. 新建仓库，推送到 `main`。
2. **Settings → Pages → Deploy from a branch → main / root**。
3. 访问 `https://<username>.github.io/<repo>/`。

仓库已包含 `.nojekyll`，当前通过 `main / root` 分支部署。  
详细说明见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

---

## 许可证

- **代码**：MIT，见 [LICENSE](LICENSE)
- **AI 生成图像 / 视频**：CC BY-NC 4.0，见 [LICENSE-ASSETS](LICENSE-ASSETS)
- **故事 / 角色 / 文本**：原创，非商业使用
- **配音 / 音乐**：神经 TTS / 原创合成，非商业使用
- 本项目为**非商业**技术 Demo；不得用于商业发行。

---

## 致谢

- **DeepSeek Flash**：代码、视觉小说引擎、UI、WebAudio 音效、文档
- **MiniMax H3**：场景、角色、片头片尾视频、MiniMax Music3 BGM
- **ComfyUI**：图像 / 视频生成管线
- 所有角色、故事与文本均为原创

---

**如果这个 Demo 对你有帮助，欢迎 star、提 issue，或替换成你自己的非商业 AI 资产。**
