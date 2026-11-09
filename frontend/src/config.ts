export const company = {
  name: 'Evocom',
  legalName: 'Evocom Information Technology Services',
  wordmark: 'Evocom Information Technology Services',
  descriptor: 'Information Technology Services',
  tagline: 'CCTV & security solutions',
  city: 'Rodriguez, Rizal',
  addressLines: ['B18 L20 Ph 1, Costa Homes 5', 'Rodriguez, Rizal, Philippines'],
  address: 'B18 L20 Ph 1, Costa Homes 5, Rodriguez, Rizal, Philippines',
  phoneDisplay: '0920 257 4663',
  phoneHref: 'tel:09202574663',
  email: 'evocom_its@hotmail.com',
  mapQuery: '14.720758,121.132367',
  since: 2012,
}

export const terms = {
  downPaymentPercent: 70,
  warrantyYears: 1,
}

export const services = [
  {
    title: 'CCTV Installation',
    body: 'Professional installation of HD and 4K surveillance cameras for homes, offices, warehouses, and commercial properties.',
  },
  {
    title: 'IP Camera Systems',
    body: 'Network-based IP camera systems with remote access, real-time streaming, and cloud storage integration.',
  },
  {
    title: 'Security System Design',
    body: 'Site surveys and custom security layouts engineered to eliminate blind spots and maximise coverage.',
  },
  {
    title: 'Cloud & Remote Viewing',
    body: 'Access your cameras from anywhere via smartphone or PC with encrypted cloud storage and instant alerts.',
  },
  {
    title: 'Motion Detection & Alerts',
    body: 'Smart motion detection with instant push notifications and automated recording triggered by activity.',
  },
  {
    title: 'Maintenance & Support',
    body: 'Scheduled maintenance, firmware updates, and on-site repair for installed systems.',
  },
]

export const propertyTypes = ['Residential', 'Commercial', 'Warehouse', 'School', 'Healthcare', 'Retail']

export const productTypes = [
  'Bullet Camera',
  'PTZ Camera',
  'Dome Camera',
  'Turret Camera',
  'Multi-Sensor Camera',
] as const

export const productFilters = ['All', ...productTypes] as const

export const supplierFilters = ['All', 'Hikvision', 'Dahua', 'Imou', 'Evocom'] as const
