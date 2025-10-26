import { useEffect } from 'react';

interface SitemapURL {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const SITEMAP_URLS: SitemapURL[] = [
  {
    url: 'https://candivoc.com/',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 1.0
  },
  {
    url: 'https://candivoc.com/dashboard',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.8
  },
  {
    url: 'https://candivoc.com/scenarios',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: 'https://candivoc.com/tarifs',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: 'https://candivoc.com/login',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.5
  },
  {
    url: 'https://candivoc.com/register',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.5
  }
];

export const generateSitemap = (): string => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_URLS.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

export const generateRobotsTxt = (): string => {
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://candivoc.com/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Disallow temp directories
Disallow: /temp/
Disallow: /.tmp/
Disallow: /node_modules/`;
};

// Hook pour générer et télécharger le sitemap
export const useSitemapGenerator = () => {
  useEffect(() => {
    // Générer le sitemap au montage du composant
    const sitemap = generateSitemap();
    const robotsTxt = generateRobotsTxt();

    // Logger pour développement
    if (import.meta.env.DEV) {
      console.log('🗺️ Sitemap généré:');
      console.log(sitemap);
      console.log('🤖 Robots.txt généré:');
      console.log(robotsTxt);
    }
  }, []);

  const downloadSitemap = () => {
    const sitemap = generateSitemap();
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadRobotsTxt = () => {
    const robotsTxt = generateRobotsTxt();
    const blob = new Blob([robotsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    downloadSitemap,
    downloadRobotsTxt,
    sitemapUrls: SITEMAP_URLS
  };
};