# 部署说明

纯静态站点：无后端、无构建步骤、无运行时 AI 调用。

---

## 1. 本地运行

```bash
cd echo-zero
python3 -m http.server 8080
```

打开 `http://127.0.0.1:8080/`。

也可以双击 `index.html`，但推荐 HTTP 服务器，视频/音频更稳定。

---

## 2. GitHub Pages

### 方式 A：分支部署

1. 推送仓库到 `main`。
2. **Settings → Pages**。
3. Source 选择 **Deploy from a branch**。
4. Branch 选 `main`，目录选 `/ (root)`。
5. 访问：

```text
https://<username>.github.io/<repo>/
```

### 方式 B：GitHub Actions

仓库包含 `.github/workflows/pages.yml`。  
**Settings → Pages → Source** 选择 **GitHub Actions**，推送到 `main` 即可。

---

## 3. 仓库体积

- 场景 8 张 WebP：约 3 MB
- 角色 5 张透明 WebP：约 0.6 MB
- 视频 2 段：约 6.5 MB
- 配音 143 句 MP3：约 3.8 MB
- BGM 4 段 MP3：约 3 MB
- 总计约 **28 MB**

低于 GitHub Pages 单站点 1 GB、单文件 100 MB 限制。

### 想减小体积

- 把 MP3 再压到更低码率，或删除未使用截图
- 删除未使用的 `screenshots/`
- 视频可换成 WebM

---

## 4. 路径与大小写

- 全部相对路径
- GitHub Pages 区分大小写
- 入口必须是 `index.html`
- `.nojekyll` 已包含

---

## 5. 手机 Web / PWA

- 已包含 `manifest.webmanifest` 与 192/512 图标
- 手机浏览器可「添加到主屏幕」
- 竖屏/横屏、刘海安全区、触控按钮均已适配
- 无 Service Worker；不承诺完全离线安装，仅做 Web App 入口

## 6. 媒体

- 视频：`<video muted playsinline>`，桌面/移动端均可用
- 音频：首次点击后初始化 WebAudio；语音用 `<audio>` 播放
- 浏览器自动播放策略要求先有点击；标题菜单点击已满足

---

## 7. 存档

- localStorage，按 origin 隔离
- GitHub Pages 与本地 `127.0.0.1` 不共享
- 换域名/路径会丢失
- 可在游戏内 SAVE / LOAD 迁移（同一 origin）

---

## 8. 常见问题

### 404

- 确认入口 `index.html`
- 确认 `assets/` 已提交
- 确认 Pages 已构建
- 检查大小写

### 视频/配音不播放

- 确认 `assets/generated/video/`、`audio/voice/` 已提交
- 检查控制台 404
- 手机浏览器可能需要用户点击后才能播放

### 页面空白

- 检查 `assets/manifest.js` 是否存在
- 运行 `python3 tools/build_manifest.py`

---

## 9. 非商业

- 代码 MIT
- 生成素材 CC BY-NC 4.0
- 故事/角色/文本原创
- 仅限非商业展示
