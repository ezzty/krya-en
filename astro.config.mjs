// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://en.krya.com',
  output: 'static',
  compressHTML: true,
  markdown: {
    remarkPlugins: [
      // 尝试使用 remark 插件
    ],
    rehypePlugins: [
      // 尝试使用 rehype 插件
    ],
    shikiConfig: {
      theme: 'dark-plus',
    },
  },
  vite: {
    build: {
      // 合并所有 CSS 到一个文件
      cssCodeSplit: false,
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
});
