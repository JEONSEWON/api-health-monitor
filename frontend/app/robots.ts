import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/login', '/register', '/api/'],
    },
    sitemap: 'https://checkapi.io/sitemap.xml',
  };
}
