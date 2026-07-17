// 构建后处理：仅为文章页图片添加阿里云 OSS w950 参数
// 范围：仅 <img src> 与 <source srcset>，不碰 script/link 等其它 src
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

/** 是否应追加 OSS 图片处理参数 */
function shouldProcessImageUrl(url) {
  if (!url) return false;
  if (url.startsWith('data:') || url.startsWith('blob:')) return false;
  // 明显非图片资源
  if (url.includes('/js/') || url.includes('logo.svg')) return false;
  if (/\.(js|mjs|css|json|xml|map)(\?|$)/i.test(url)) return false;
  // 第三方脚本域名（双保险）
  if (/cloud\.umami\.is|googletagmanager|google-analytics|clarity\.ms/i.test(url)) return false;
  return true;
}

// 处理文章图片 URL - 添加 w950 参数
function processArticleImageUrl(url) {
  if (!shouldProcessImageUrl(url)) return url;

  // 移除已有的 OSS 参数
  const withoutOssParam = url.replace(/\?x-oss-process=[^&\s]*/, '');

  // 添加 w950 参数
  return `${withoutOssParam}?x-oss-process=style/w950`;
}

// 处理 srcset 中的多个 URL（保留 140w 等描述符）
function processSrcset(srcset) {
  if (!srcset) return srcset;
  return srcset.split(',').map((part) => {
    const trimmed = part.trim();
    const match = trimmed.match(/^(\S+)(\s+.+)?$/);
    if (!match) return trimmed;
    const newUrl = processArticleImageUrl(match[1]);
    return match[2] ? `${newUrl}${match[2]}` : newUrl;
  }).join(', ');
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

    // 仅处理 <img ... src="...">（不匹配 script/iframe 等）
    content = content.replace(/<img\b([^>]*?)\bsrc="([^"]+)"([^>]*)>/gi, (match, pre, url, post) => {
      const newUrl = processArticleImageUrl(url);
      if (newUrl !== url) {
        modified = true;
        totalImages++;
        return `<img${pre}src="${newUrl}"${post}>`;
      }
      return match;
    });

    // 仅处理 <source ... srcset="...">（picture 响应式）
    content = content.replace(/<source\b([^>]*?)\bsrcset="([^"]+)"([^>]*)>/gi, (match, pre, srcset, post) => {
      const newSrcset = processSrcset(srcset);
      if (newSrcset !== srcset) {
        modified = true;
        return `<source${pre}srcset="${newSrcset}"${post}>`;
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

console.log(`\n✅ Processed ${totalImages} images in ${postDirs.length} posts (img/source only).`);
