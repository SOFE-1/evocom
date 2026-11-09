import type { Product } from './types'

const photos: Record<string, string> = {
  'evoshield-dome-4k': '/media/products/dome-camera.jpg',
  'evoguard-bullet-pro': '/media/products/bullet-camera.jpg',
  'evopan-360-ptz': '/media/products/ptz-camera.jpg',
  'evoslim-mini-dome': '/media/products/mini-dome.jpg',
  'evowatch-turret-5mp': '/media/products/turret-camera.jpg',
  'evoarray-360-multi': '/media/products/multi-sensor.jpg',
}

const categoryPhotos: Record<string, string> = {
  'Bullet Camera': '/media/products/bullet-camera.jpg',
  'Dome Camera': '/media/products/dome-camera.jpg',
  'PTZ Camera': '/media/products/ptz-camera.jpg',
  'Turret Camera': '/media/products/turret-camera.jpg',
  'Multi-Sensor Camera': '/media/products/multi-sensor.jpg',
}

type PhotoSource = {
  slug: string
  category?: string
  image_path?: string | null
}

function isIllustration(path: string): boolean {
  return path.toLowerCase().endsWith('.svg')
}

export function hasProductImage(source: { image_path?: string | null }): boolean {
  return typeof source.image_path === 'string' && source.image_path.trim() !== ''
}

function mediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  if (path.startsWith('/storage/')) {
    return `http://${window.location.hostname}:8000${path}`
  }
  return path
}

export function productPhoto(source: string | PhotoSource): string {
  if (typeof source !== 'string') {
    const path = source.image_path?.trim() ?? ''
    if (path !== '' && !isIllustration(path)) {
      return mediaUrl(path)
    }
    if (source.category && categoryPhotos[source.category]) {
      return categoryPhotos[source.category]
    }
  }

  const slug = typeof source === 'string' ? source : source.slug
  return photos[slug] ?? categoryPhotos['Bullet Camera']
}

export function productBadge(product: Product): string | null {
  const badge = product.specifications.Badge
  return badge && badge.trim() !== '' ? badge : null
}

export function visibleSpecs(product: Product): Array<[string, string]> {
  return Object.entries(product.specifications).filter(([key]) => key !== 'Badge' && key !== 'Brand')
}
