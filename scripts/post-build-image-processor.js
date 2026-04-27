// 构建后处理：为文章页面的图片添加阿里云 OSS w950 参数
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const distDir = join(__dirname, '..', 'dist', 'post');

// 检查目录是否存在
if (!existsSync(distDir)) {
  console.log(`Skip: ${distDir} does not exist`);
  process.exit(0);
}

// 处理文章图片 URL - 添加 w950 参数
function processArticleImageUrl(url) {
  if (!url) return url;
  
  // 跳过 data URI 或特殊协议
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  
  // 移除已有的 OSS 参数
  const withoutOssParam = url.replace(/\?x-oss-process=[^&\s]*/, '');
  
  // 添加 w950 参数
  return `${withoutOssParam}?x-oss-process=style/w950`;
}

// 处理 srcset 中的多个 URL
function processSrcset(srcset) {
  if (!srcset) return srcset;
  return srcset.split(',').map(u => processArticleImageUrl(u.trim())).join(', ');
}

// 读取所有文章目录
const postDirs = readdirSync(distDir).filter(dir => {
  return !dir.startsWith('.');
});

console.log(`Processing ${postDirs.length} posts...`);

let totalImages = 0;

postDirs.forEach(dir => {
  const htmlFile = join(distDir, dir, 'index.html');
  
  try {
    let content = readFileSync(htmlFile, 'utf-8');
    let modified = false;
    
    // 处理 img 标签的 src 属性
    content = content.replace(/src="([^"]+)"/g, (match, url) => {
      // 跳过 logo.svg 等非文章图片
      if (url.includes('logo.svg') || url.includes('/js/') || url.includes('data:')) {
        return match;
      }
      
      const newUrl = processArticleImageUrl(url);
      if (newUrl !== url) {
        modified = true;
        totalImages++;
        return `src="${newUrl}"`;
      }
      return match;
    });
    
    // 处理 source 标签的 srcset 属性
    content = content.replace(/srcset="([^"]+)"/g, (match, srcset) => {
      const newSrcset = processSrcset(srcset);
      if (newSrcset !== srcset) {
        modified = true;
        return `srcset="${newSrcset}"`;
      }
      return match;
    });
    
    if (modified) {
      writeFileSync(htmlFile, content, 'utf-8');
      console.log(`✓ ${dir}/index.html`);
    }
  } catch (err) {
    console.error(`Error processing ${htmlFile}:`, err.message);
  }
});

console.log(`\n✅ Processed ${totalImages} images in ${postDirs.length} posts.`);
