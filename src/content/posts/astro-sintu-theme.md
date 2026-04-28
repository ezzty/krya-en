---
title: How to deploy a static blog for free using Astro
pubDate: 2026-04-20
author: jin
draft: false
categories:
  - Technology
tags:
  - Blog
  - Astro
  - Typecho
  - Migration
---
![as-3.avif](https://user0102.cn.imgto.link/public/20260422/as-3.avif)

With dynamic blogs, I was always worried about forgetting to renew the server or running into issues during program upgrades. After discovering static blogs, I realized this was an ideal solution. After comparing Hugo, Hexo, and Astro, I ultimately chose Astro.

### Advantages of Static Blogs

1. **Free Hosting** - Apart from the domain name, major tech companies offer free hosting services for individual developers.
2. **Zero Maintenance** - Articles are stored on your own computer. As long as the hosting platform doesn't shut down, your blog can run forever.
3. **Pre-rendered** - Static blogs generate pure HTML/CSS/JS files before deployment, with no backend.
4. **CDN Compatible** - Since everything is static files, distributing them to global edge nodes means millisecond-level loading for users worldwide.

### Why Choose Astro

1. **Static-First** - Generates pure HTML files, no database or server needed.
2. **Excellent Performance** - Zero JavaScript by default, extremely fast loading.
3. **High Flexibility** - Supports Markdown, MDX, and mixed frameworks.
4. **Active Ecosystem** - Vibrant community, comprehensive documentation, rich plugin library.

### The Sintu Single-Column Theme for Astro

This Astro single-column template theme was designed and built by myself. I recently had Hermes migrate it from Typecho to Astro. During the migration, I made quite a few feature upgrades, and the code is now one-third more concise than before. I'll take this opportunity to remark on how the popularization of AI has made previously complex tasks much simpler — development progress has been almost godlike, code quality is near perfect, and it brings me infinitely close to the level of a genius programmer 😂.

#### Feature Highlights

1. **Perfect Performance** - Millisecond-level loading, Google Lighthouse scores a perfect 100 on both mobile and desktop.
2. **Dark Mode** - Added a dark mode toggle next to the logo.
3. **Thumbnail Hover Zoom** - Besides zooming in, clicking the image navigates to the article page.
4. **No Preview Images on Mobile** - Controls resource loading based on screen size, saving bandwidth.
5. **Aliyun OSS Image Processing** - Images are processed via OSS, with parameters added after HTML rendering, saving bandwidth.
6. **Performance Optimization** - CSS bundled via Vite, image lazy loading.
7. **Responsive Design** - Perfect adaptation for desktop and mobile, using a unified grid system.
8. **Comment Box** - Integrated using the official Twikoo solution.

### Publishing Workflow

1. Write your Markdown article locally.
2. Send a message to Hermes Agent to push to the GitHub repository (or push it yourself via GitHub).
3. Tencent EdgeOne, Vercel, Netlify, or Cloudflare Pages automatically pull the update and build.
4. Auto-deployed to global CDN nodes.

### Open Source

This theme is open source. If you like it, you can also tip the author:

[https://github.com/ezzty/krya-en](https://github.com/ezzty/krya-en)
