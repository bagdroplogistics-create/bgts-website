import type { MetadataRoute } from 'next'
import { services } from '@/data/services'
import { industries } from '@/data/industries'

const BASE_URL = 'https://bgts.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0  },
    { url: `${BASE_URL}/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8  },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${BASE_URL}/fleet`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7  },
    { url: `${BASE_URL}/industries`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/tracking`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${BASE_URL}/quote`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BASE_URL}/contact`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7  },
    // EkoHaul
    { url: `${BASE_URL}/ekohaul`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${BASE_URL}/ekohaul/esg`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8  },
    { url: `${BASE_URL}/ekohaul/book`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
  ]

  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url:             `${BASE_URL}/services/${s.slug}`,
    lastModified:    new Date(),
    changeFrequency: 'monthly',
    priority:        0.7,
  }))

  const industryPages: MetadataRoute.Sitemap = industries.map((i) => ({
    url:             `${BASE_URL}/industries/${i.slug}`,
    lastModified:    new Date(),
    changeFrequency: 'monthly',
    priority:        0.65,
  }))

  return [...staticPages, ...servicePages, ...industryPages]
}
