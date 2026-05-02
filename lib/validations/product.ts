import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional().nullable(),
  cost: z.number().positive().optional().nullable(),
  sku: z.string().min(3).regex(
    /^[A-Za-z0-9\-\(\)]+$/, 
    'SKU can only contain letters, numbers, hyphens, and parentheses'
  ),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'OUT_OF_STOCK']).default('DRAFT'),
  featured: z.boolean().default(false),
  images: z.array(z.string()).optional(),
})

export type ProductInput = z.infer<typeof productSchema>