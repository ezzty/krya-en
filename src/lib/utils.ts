// 从 Markdown 内容中提取第一张图片
export function extractFirstImage(content: string): string | null {
  const mdImgWithTitlePattern = /!\[([^\]]*)\]\(([^"]+?)\s+"[^"]*"\)/;
  let match = content.match(mdImgWithTitlePattern);
  if (match && match[2]) {
    return match[2].trim();
  }
  
  const mdImgSimplePattern = /!\[([^\]]*)\]\(([^)\s]+)\)/;
  match = content.match(mdImgSimplePattern);
  if (match && match[2]) {
    return match[2].trim();
  }
  
  const htmlImgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const htmlMatch = content.match(htmlImgRegex);
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1];
  }
  
  return null;
}

// 格式化日期：2026-04-18
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

// 生成页码列表（最多显示 3 个页码）
export function getPageNumbers(current: number, total: number): number[] {
  if (total <= 3) {
    // 总页数 <= 3，显示所有页码
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  if (current <= 2) {
    // 当前页在前 2 页，显示 1-3
    return [1, 2, 3];
  }
  
  if (current >= total - 1) {
    // 当前页在后 2 页，显示最后 3 页
    return [total - 2, total - 1, total];
  }
  
  // 当前页在中间，显示当前页前后各 1 页
  return [current - 1, current, current + 1];
}

// 处理缩略图 URL
export function processThumbnailUrl(url: string | null, thumbnailStyle: string = 'w140'): string | null {
  if (!url) return null;
  const withoutOssParam = url.replace(/\?x-oss-process=[^&\s]*/, '');
  return `${withoutOssParam}?x-oss-process=style/${thumbnailStyle}`;
}

// 生成随机缩略图索引
export function getRandomThumbnailIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % 6;
}

// 清理 Markdown
export function stripMarkdown(content: string): string {
  let text = content;
  text = text.replace(/!\[([^\]]*)\]\([^"\n]+?"[^"]*"\)/g, '');
  text = text.replace(/!\[([^\]]*)\]\(([^)\s\n]+)\)/g, '');
  text = text.replace(/\[([^\]]*)\]\(([^)]+)\)/g, '$1');
  text = text.replace(/^#{1,6}\s+/gm, '');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/^>\s+/gm, '');
  text = text.replace(/^[-*]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');
  text = text.replace(/^[-*_]{3,}$/gm, '');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/\n\s*\n/g, '\n');
  return text.trim();
}

// 计算字数
export function countWords(content: string): number {
  const plainText = stripMarkdown(content);
  const chineseChars = plainText.match(/[\u4e00-\u9fa5]/g);
  const chineseCount = chineseChars ? chineseChars.length : 0;
  const englishWords = plainText.match(/[a-zA-Z0-9]+/g);
  const englishCount = englishWords ? englishWords.length : 0;
  return chineseCount + englishCount;
}

// 格式化文章列表
export interface FormattedPost {
  title: string;
  slug: string;
  author: string;
  pubDate: string;
  wordCount: number;
  excerpt: string;
  thumbnail: string;
}

export interface FormatPostsResult {
  posts: FormattedPost[];
  totalPages: number;
  currentPage: number;
}

export function formatPosts(posts: any[], pageSize: number, page: number = 1): FormatPostsResult {
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime();
  });
  
  const totalPages = Math.ceil(sortedPosts.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = page * pageSize;
  const paginatedPosts = sortedPosts.slice(start, end);
  
  const formattedPosts = paginatedPosts.map((post) => {
    let thumbnail = post.data.thumbnail;
    if (!thumbnail) {
      const firstImage = extractFirstImage(post.body || '');
      if (firstImage) {
        thumbnail = firstImage;
      } else {
        thumbnail = `/img/random/${getRandomThumbnailIndex(post.id)}.webp`;
      }
    }
    
    thumbnail = processThumbnailUrl(thumbnail, 'w140');
    const plainText = stripMarkdown(post.body || '');
    const wordCount = countWords(post.body || '');
    
    return {
      title: post.data.title,
      slug: post.id.replace(/\.[^.]+$/, ''),
      author: post.data.author || 'Jin',
      pubDate: post.data.pubDate.toISOString(),
      wordCount,
      excerpt: post.data.description || plainText.slice(0, 100),
      thumbnail,
    };
  });
  
  return {
    posts: formattedPosts,
    totalPages,
    currentPage: page,
  };
}
