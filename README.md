# Quick Add Application

基于 Next.js 14 构建的快速添加应用，提供高效的内容管理解决方案。

## 技术栈

- ⚡️ [Next.js 14](https://nextjs.org/) - React 框架
- 🔥 [TypeScript](https://www.typescriptlang.org/) - 类型安全
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

## 开发环境设置

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── app/                # App Router 路由
│   ├── quick-add/     # 快速添加功能
│   └── page.tsx       # 首页
├── components/        # UI 组件
└── lib/              # 工具函数
```

## 构建部署

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 开发规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 规则
- 使用 Prettier 进行代码格式化
