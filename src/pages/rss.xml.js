import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { marked } from 'marked';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Process date: convert pubDate to Beijing Time (+08:00), precise to minutes
function normalizePubDate(date) {
  if (!date) return date;
  
  // If Date object
  if (date instanceof Date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    
    // If UTC 00:00 (original date has no time), default to Beijing Time 09:00
    if (hours === 0 && minutes === 0) {
      return new Date(`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}T09:00:00+08:00`);
    }
    
    // Already has time, convert to +08:00 format
    const utcTime = date.getTime();
    const beijingTime = new Date(utcTime + 8 * 3600 * 1000);
    const by = beijingTime.getUTCFullYear();
    const bm = beijingTime.getUTCMonth();
    const bd = beijingTime.getUTCDate();
    const bh = beijingTime.getUTCHours();
    const bmin = beijingTime.getUTCMinutes();
    return new Date(`${by}-${String(bm+1).padStart(2,'0')}-${String(bd).padStart(2,'0')}T${String(bh).padStart(2,'0')}:${String(bmin).padStart(2,'0')}:00+08:00`);
  }
  
  // If string
  if (typeof date === 'string') {
    // YYYY-MM-DD format → Beijing Time 09:00
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Date(`${date}T09:00:00+08:00`);
    }
    // Has time but no timezone → default to Beijing Time
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(date) && !date.includes('+')) {
      return new Date(`${date}+08:00`);
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
        link: `/post/${post.id.replace(/\.[^.]+$/, '')}/`,
        author: post.data.author || 'Jin',
      };
    })),
    customData: `<language>en</language>`,
  });
}
