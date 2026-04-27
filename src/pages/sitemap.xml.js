import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('posts');
  
  // Filter out drafts
  const publishedPosts = posts.filter(post => !post.data.draft);
  
  // Sort by publication date
  publishedPosts.sort((a, b) => {
    return new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime();
  });

  const siteUrl = 'https://krya.com';
  
  // Collect all categories and tags (using published posts)
  const categorySet = new Set();
  const tagSet = new Set();
  publishedPosts.forEach(post => {
    const categories = post.data.categories || [];
    const tags = post.data.tags || [];
    categories.forEach(cat => categorySet.add(cat));
    tags.forEach(tag => tagSet.add(tag));
  });
  
  // Generate URL list
  const urls = [
    // Home page
    {
      loc: siteUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    },
    // Archives page
    {
      loc: `${siteUrl}/archives`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.8,
    },
    // About page
    {
      loc: `${siteUrl}/about`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.5,
    },
    // Categories list page
    {
      loc: `${siteUrl}/categories`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.7,
    },
    // Category detail pages
    ...Array.from(categorySet).map(category => ({
      loc: `${siteUrl}/categories/${encodeURIComponent(category)}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.6,
    })),
    // Tags list page
    {
      loc: `${siteUrl}/tags`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.7,
    },
    // Tag detail pages
    ...Array.from(tagSet).map(tag => ({
      loc: `${siteUrl}/tags/${encodeURIComponent(tag)}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.6,
    })),
    // Search page
    {
      loc: `${siteUrl}/search`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.5,
    },
    // Paginated pages
    ...Array.from({ length: Math.max(0, Math.ceil(publishedPosts.length / 8) - 1) }, (_, i) => ({
      loc: `${siteUrl}/p/${i + 2}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.5,
    })),
    // All posts
    ...publishedPosts.map(post => ({
      loc: `${siteUrl}/post/${post.id.replace(/\.[^.]+$/, '')}`,
      lastmod: new Date(post.data.pubDate).toISOString(),
      changefreq: 'weekly',
      priority: 0.6,
    })),
  ];

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
