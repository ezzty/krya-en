import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { marked } from 'marked';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// 处理日期：如果只有日期没有时间（UTC 00:00:00），自动添加东八区 16:00:00
function normalizePubDate(date) {
  if (!date) return date;
  
  // 如果是 Date 对象，检查是否是 UTC 00:00:00（说明只有日期没有时间）
  if (date instanceof Date) {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    
    // 如果是 UTC 00:00:00，说明原日期没有时间信息，添加东八区 16:00
    if (hours === 0 && minutes === 0 && seconds === 0) {
      // 创建新的 Date，设置为东八区 16:00（即 UTC 08:00）
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      return new Date(Date.UTC(year, month, day, 8, 0, 0)); // UTC 08:00 = 北京时间 16:00
    }
    
    // 如果已经有时间信息，直接返回
    return date;
  }
  
  // 如果是字符串，尝试转换
  if (typeof date === 'string') {
    // 如果只有日期部分（YYYY-MM-DD），添加时间
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Date(`${date}T16:00:00+08:00`);
    }
    return new Date(date);
  }
  
  return date;
}

export async function GET(context) {
  const posts = (await getCollection('posts')).filter(post => !post.data.draft);
  
  // Sort by date, output latest 20 posts
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime();
  }).slice(0, 20);
  
  return rss({
    title: 'krya | Jin\'s Blog',
    description: 'Jin\'s personal blog - travel, life, thoughts',
    site: 'https://en.krya.com',
    items: await Promise.all(sortedPosts.map(async (post) => {
      const markdownContent = post.body || '';
      const htmlString = await marked.parse(markdownContent);
      
      return {
        title: post.data.title,
        description: htmlString,
        pubDate: normalizePubDate(post.data.pubDate),
        link: `/post/${post.id.replace(/\.[^.]+$/, '')}`,
        author: post.data.author || 'Jin',
      };
    })),
    customData: `<language>en</language>`,
  });
}
