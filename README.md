# FunctionArchive — AI 功能实现工具

提交功能需求，AI Worker 自动编码实现并提交至 SVN。

## 📋 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **操作系统**: Windows / macOS / Linux

## 架构

```
用户(Electron客户端) → Golang后端(soyooplatform) → 任务队列 → Worker(AI编码) → SVN提交
```

## 🔗 后端

后端服务复用 **[soyooplatform](https://github.com/soyooAiTools/soyooplatform)**

- **后端地址**: `https://playcools.top/soyoo/api/` (生产环境)
- **本地开发**: `http://localhost:8080`

## ✨ 功能

- 📝 **功能需求提交** — 填写项目名称、SVN 地址、功能描述、上传参考图
- 🤖 **AI 自动编码** — Worker 拉取代码、AI 生成实现、自动测试
- 📦 **SVN 自动提交** — 验证通过后自动提交代码到指定 SVN 仓库
- 📊 **任务跟踪** — 实时查看任务状态、代码变更、执行日志

## 表单字段

| 字段 | 必填 | 说明 |
|------|------|------|
| 项目名称 | ✅ | 项目标识 |
| SVN 地址 | ✅ | Worker 自动 checkout 的代码仓库 (svn://47.101.191.213:3690/...) |
| 功能描述 | ✅ | 需要实现的功能详细描述 |
| 参考图片 | ❌ | UI 效果图、交互示意图等 |

## 📁 目录结构

```
functionarchive/
├── electron/
│   ├── src/
│   │   ├── main.js              # Electron 主进程
│   │   ├── preload.js           # 预加载脚本
│   │   └── renderer/
│   │       ├── index.html       # HTML 入口
│   │       ├── App.jsx          # 根组件 (ProLayout + 路由)
│   │       ├── pages/
│   │       │   ├── FunctionCreate.jsx  # 创建功能实现任务
│   │       │   ├── FunctionDetail.jsx  # 功能实现详情
│   │       │   ├── TaskList.jsx        # 任务列表
│   │       │   └── Login.jsx           # 登录页
│   │       └── api/
│   │           └── client.js           # 后端 API 调用
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🚀 快速启动

### 开发模式

```bash
cd electron
npm install
npm run dev     # Vite dev server + Electron
```

### 打包部署

```bash
cd electron
npm run build   # 构建前端
npm run package # 打包 Electron 应用
```

## ⚙️ 配置

### 修改后端地址

编辑 `electron/src/api/client.js`：

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://playcools.top/soyoo/api'
  : 'http://localhost:8080';
```

## 📦 部署

桌面应用无需服务器部署，用户直接运行打包后的可执行文件即可。

## 🔧 技术栈

- **Electron** — 桌面应用框架
- **React 18** — 前端框架
- **Ant Design 5** + **ProLayout** — UI 组件库
- **Vite** — 构建工具
- **后端**: Golang (soyooplatform)
- **AI Worker**: Claude Sonnet 4.5
- **版本控制**: SVN
