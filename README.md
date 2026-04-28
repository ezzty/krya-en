# Astro Sintu Theme

A simple blog theme, optimized single-column layout for mobile/tablet，originally designed by the author.

## Features 

🚀 Powered by Astro 6.x – High performance guaranteed.

🌙 Dark Mode Support – Seamless switching between light and dark themes.

📱 Responsive Design – Fully optimized for mobile and diverse screen sizes.

🎨 Clean & Elegant – Minimalist design focused on readability.

📝 Markdown Blogging – Built-in support for Markdown-based content.

## Quick Start 

```bash
# Install dependencies
npm install

# Start development server 
npm run dev

# Build for production 
npm run build

# Preview production build 
npm run preview
```

## Configuration 

### Image Processing 

- Image Optimization: Automatically scale homepage thumbnails using Alibaba Cloud OSS image processing parameters.

### Comment syste

- Twikoo Comment system：https://twikoo.js.org/en/


### Theme Colors 

- Edit  `src/styles/variables.css`  to customize the theme colors.


## Deployment 

### Static Hosting 

The built dist/ directory can be deployed to any static hosting service: 

- Vercel
- Netlify
- Cloudflare Pages （set 'Astro'，and '/dist'）
- GitHub Pages
- AWS AMPLIFY

### Docker

```bash
docker build -t astro-sintu-theme .
docker run -p 8080:80 astro-sintu-theme
```

## Tech Stack 

- [Astro](https://astro.build/) 
- TypeScript 
- CSS Variables 

## License 

MIT
