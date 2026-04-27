import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { marked } from 'marked';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

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
        pubDate: post.data.pubDate,
        link: `/post/${post.id.replace('.md', '')}`,
        author: post.data.author || 'Jin',
      };
    })),
    customData: `<language>en</language>`,
  });
}
