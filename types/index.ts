import { User as PrismaUser, Product, Order, ProductVariant } from '@prisma/client'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  variantId?: string
  variantName?: string
  maxQuantity: number
}

export interface CartState {
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  itemCount: number
}

export interface User extends PrismaUser {
  role: 'USER' | 'ADMIN' | 'MANAGER'
}

export interface ProductWithRelations extends Product {
  categories?: Category[]
  variants?: ProductVariant[]
  reviews?: Review[]
  avgRating?: number
  reviewCount?: number
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: string
  children?: Category[]
}

export interface Review {
  id: string
  rating: number
  title?: string
  content?: string
  user: {
    name: string
    image?: string
  }
  createdAt: Date
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
  user?: User
  address?: Address
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  total: number
  product: Product
}

export interface Address {
  id: string
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

