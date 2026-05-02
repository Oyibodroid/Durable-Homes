import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://durablehomes.com'

  // Get all products
  const products = await prisma.product.findMany({
    where: { publishedAt: { not: null } },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Get all categories
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/shop/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/shop?category=${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...productUrls,
    ...categoryUrls,
  ]
}