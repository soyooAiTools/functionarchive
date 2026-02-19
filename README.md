# FunctionArchive

AI 功能实现工具 — 提交功能需求，AI Worker 自动编码实现。

## 架构

```
用户(Electron客户端) → Golang后端 → 任务队列 → Worker(AI编码) → SVN提交
```

## 表单字段

| 字段 | 必填 | 说明 |
|------|------|------|
| 项目名称 | ✅ | 项目标识 |
| SVN 地址 | ✅ | Worker 自动 checkout 的代码仓库 |
| 功能描述 | ✅ | 需要实现的功能详细描述 |
| 参考图片 | ❌ | UI 效果图、交互示意图等 |

## 开发

```bash
cd electron
npm install
npm run dev
```

## 技术栈

- Electron + Vite + React 18
- Ant Design 5 + ProLayout
- 后端复用 soyooplatform (Golang)
