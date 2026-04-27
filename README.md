# Astro Sintu Theme

一个简洁的 Astro 博客主题，作者原创设计。

## 特性

- 🚀 基于 Astro 5.x，性能优异
- 🌙 暗黑模式支持
- 📱 响应式设计，移动端优化
- 🎨 简洁优雅的设计风格
- 📝 支持 Markdown 博客文章

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 配置

### 网站信息

编辑 `astro.config.mjs` 或 `src/config.ts` 修改：

- 网站标题
- 网站描述
- 作者信息
- 社交链接

### 主题颜色

编辑 `src/styles/variables.css` 修改主题颜色。

## 部署

### 静态托管

构建后的 `dist/` 目录可以部署到任何静态托管服务：

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- 阿里云 OSS

### Docker

```bash
docker build -t astro-sintu-theme .
docker run -p 8080:80 astro-sintu-theme
```

## 技术栈

- [Astro](https://astro.build/) - 静态站点生成器
- TypeScript - 类型安全
- CSS Variables - 主题定制

## 许可证

MIT

## 作者

Jin (@ezzty)
