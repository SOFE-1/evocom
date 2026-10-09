import type { Product } from './types'

const photos: Record<string, string> = {
  'evoshield-dome-4k': '/media/cam-lot.jpg',
  'evoguard-bullet-pro': '/media/cam-white.jpg',
  'evopan-360-ptz': '/media/cam-color.jpg',
  'evoslim-mini-dome': '/media/cam-white.jpg',
  'evowatch-turret-5mp': '/media/cam-lot.jpg',
  'evoarray-360-multi': '/media/wall.jpg',
}

const focus: Record<string, string> = {
  'evoshield-dome-4k': 'center 30%',
  'evoslim-mini-dome': 'center 70%',
  'evowatch-turret-5mp': 'left center',
  'evoarray-360-multi': 'center',
}

export function productPhoto(slug: string): string {
  return photos[slug] ?? '/media/cam-white.jpg'
}

export function productFocus(slug: string): string {
  return focus[slug] ?? 'center'
}

export function productBadge(product: Product): string | null {
  const badge = product.specifications.Badge
  return badge && badge.trim() !== '' ? badge : null
}

export function visibleSpecs(product: Product): Array<[string, string]> {
  return Object.entries(product.specifications).filter(([key]) => key !== 'Badge')
}
