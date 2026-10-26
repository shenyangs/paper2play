# Paper2Play · 公式交互实验室

把一条有来源的研究公式，变成可以调参的实验。

本项目只支持 **Logistic 增长方程**：`P(t)=K/(1+A*exp(-r*t))`。粘贴文本或上传含文字的 PDF，核对来源片段，再通过 K、A、r 调整真实计算的曲线。中文为默认语言，支持小屏及键盘操作。

**当前状态：PARTIAL（AI MVP）**。已完成确定性数值实验闭环，但没有接入或调用大模型。默认零 Key 演示使用明确标注的自编资料（fixture），规则识别不是 AI 推理；“实时”仅指数值重算。

## 环境与安装

需要 **Node.js `^22.13.0 || ^24.0.0 || >=26.0.0`，推荐 24 LTS**（已验证环境见本地测试日志）、随 Node.js 提供的 npm，以及首次下载依赖和浏览器所需的网络。版本以 `package-lock.json` 为准。支持 22.13 及之后的 22.x、24.x、26.0 及以上稳定版本；23.x 和 25.x 不在锁定依赖的支持范围内，setup 与 doctor 会拒绝这些版本。

在本项目根目录执行，macOS、Linux、Windows PowerShell 使用相同命令：

```sh
npm run setup
npm run doctor
npm run dev
```

`setup` 会先执行 `npm ci --cache .npm-cache`，再安装项目内的 Chromium 无头浏览器与 FFmpeg。只写入当前项目的依赖和缓存，不安装系统组件、不要求管理员权限、不修改机器设置。已有匹配的浏览器组件会复用。网络下载失败时会返回非零并给出恢复提示。

也可以逐步执行；只体验网页时，浏览器自动化组件可暂不安装：

```sh
npm ci --cache .npm-cache
npm run browsers:install
npm run doctor
npm run dev
```

访问 **http://127.0.0.1:4209**；等价的本机入口为 http://localhost:4209（若 localhost 的 IPv6 解析无法连接，请使用前一个地址）。API 健康检查为 http://127.0.0.1:5209/api/health。两项服务只绑定 `127.0.0.1`。不需要 API Key，也不用复制 `.env.example`；本项目没有 `.env` 加载器和模型供应商接入。

## 三步体验

1. 点击 **载入示例**，看到“自编示例（fixture）”和识别出的 Logistic 方程。
2. 把 **r 增长速率**从 0.30 调至 0.60，P(10) 从 69.057 变为 97.818；曲线的 101 个采样点同时重算。K、A 同样可调。悬停曲线可看数值；键盘 Tab 定位滑块，方向键调值。
3. 点击 **查看来源**，核对自编原文。它不是论文引用，不附虚构页码。

可选：粘贴包含上述表达式的文字，再点 **识别文本**；或上传 `fixtures/logistic.pdf`，实际提取到的方程在第 2 页。PDF 的原始来源文字按原样展示，不翻译或编造内容。输入 `E=mc²` 会明确提示不支持，并关闭模拟器；可改输入或重新载入示例。

## 主要依赖与用途

| 依赖 | 用途 |
| --- | --- |
| React、React DOM | 中文交互界面与状态管理 |
| Vite、TypeScript、@vitejs/plugin-react | 本地开发、类型检查、生产构建 |
| Express、tsx、concurrently | 本地 API、TypeScript 服务运行、同时启动网页和 API |
| pdfjs-dist | 按页提取 PDF 文字；不提供 OCR |
| Recharts | 绘制实时数值曲线和悬停读数 |
| lucide-react | 界面图标 |
| Vitest | 数学、来源边界、doctor 缺依赖测试 |
| @playwright/test、Chromium、FFmpeg | 真实浏览器断言、截图和录像 |
| @types/* | 开发期类型定义 |

公式由项目内固定函数计算，不执行用户表达式、不生成代码，也不依赖父目录或兄弟项目。

## 环境诊断与恢复

`npm run doctor` 检查 Node 版本、全部直接依赖、真实 Chromium 启动、FFmpeg 和 4209/5209 端口，不检查任何无关密钥。检查失败返回 1，提示为中文。浏览器组件只用于自动化验证，缺少它仍可运行网页。

- **缺依赖**：在项目根目录重跑 `npm ci --cache .npm-cache`。缺依赖路径已实际测试，能友好提示而非抛模块堆栈。
- **端口被占用**：先在占用端口的已知服务终端按 Ctrl+C。若本项目已在运行，doctor 报占用是正常的。不要同时开两份 `npm run dev`。脚本不会替你结束其他进程，也不会改端口。
- **浏览器下载慢或失败**：重试 `npm run browsers:install`，或复用现有浏览器（见下）。首次从空缓存完整下载本轮未验证；不会把缓存复用说成全新安装通过。
- **网页连接失败**：确认 `npm run dev` 同时启动网页和 API；检查上方健康检查地址，再点击重试。后端错误与超时都有中文提示，提取时按钮暂时禁用。
- **PDF 失败**：换成未加密、未损坏、包含可选择文字的 PDF，或直接粘贴公式文本；扫描件无法识别。
- **Linux 缺浏览器系统库**：根据 Playwright 输出和发行版文档自行配置所需环境；setup 不执行系统包管理器。Windows/Linux 全新环境尚未实机验证。

复用已有 Chromium 时，用环境变量指定真实可执行文件；它只影响自动化测试。匹配的 FFmpeg 默认仍放在项目 `.browsers/`：

macOS / Linux（bash、zsh）：

```sh
export PLAYWRIGHT_EXECUTABLE_PATH="/实际路径/chromium"
npm run setup
npm run doctor
# 恢复默认：unset PLAYWRIGHT_EXECUTABLE_PATH
```

Windows PowerShell：

```powershell
$env:PLAYWRIGHT_EXECUTABLE_PATH = 'C:\实际路径\chrome.exe'
npm run setup
npm run doctor
# 恢复默认：Remove-Item Env:PLAYWRIGHT_EXECUTABLE_PATH
```

也可设置 `PLAYWRIGHT_BROWSERS_PATH` 到已有匹配缓存；安装器、doctor 和 Playwright 均遵守该值。不设置时使用项目内 `.browsers/`。不要把示意路径原样复制运行。

## 真实验证与证据

```sh
npm run build
npm run test
npm run e2e
npm run demo
```

浏览器测试会自动启动本地应用；运行前保持 4209/5209 空闲。`status.json` 记录真实结果，中文验证日志位于本地 `artifacts/logs/zh-*.log`。

验证覆盖：初始精确值、单调有界增长、来源页码、非法参数、不支持公式、文件大小边界；界面到 API 的完整提取；滑块变化对应实际数据与读数；PDF 第 2 页；小屏无横向溢出；键盘调参；忙碌状态、失败反馈与重试。doctor 缺依赖也有独立测试。既有数值断言保持不变。

中文截图：`artifacts/zh-demo.png`、`artifacts/zh-curve-evidence.png`、`artifacts/zh-mobile.png`。真实录像：`artifacts/playwright/demo/` 和 `artifacts/playwright/e2e/`。录屏、日志、构建产物、依赖和缓存都不提交 Git。构建目前有非致命的包体积警告。

早期验证曾遇到 PDF.js 过期类型选项、缺 Chromium 与缺 FFmpeg，已修复或通过明确的缓存复用解决；旧失败日志保留本地。两次慢速浏览器下载被主动停止，不算安装成功。本轮安装验证复用已有 Chromium 和本地 FFmpeg，不重复下载大型浏览器。

## 能力与安全边界

仅按预设签名识别公式（忽略大小写、空白及 Unicode 减号差异）；不理解任意等价代数式或 LaTeX 排版。匹配文字不代表验证论文科学性。K=100、A=9、r=0.3 是演示默认参数，不是从论文中提取的估计；单位为通用单位。

PDF 最大 5 MB、40 页，提取超时 15 秒，同时最多处理一个；前端请求超时 20 秒。文本最多 50,000 字符，请求体最多 100 KB。上传内容仅留在进程内存，不保存到磁盘、不发往远程服务。复杂 PDF 在页数检查前仍可能占用较多内存。没有任意本地文件读取和 URL 抓取接口。

本地开发服务没有账户或鉴权，不适合直接部署公网。真实模型、OCR、跨浏览器、任意第三方 PDF 和完整无障碍审计均未验证。界面已有可见键盘焦点、中文可访问名称和小屏适配，但不声称通过正式无障碍认证。

MIT 许可证。示例为项目自编资料；品牌及代码标识保留原文。
