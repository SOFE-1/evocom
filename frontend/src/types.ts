export type InspectionType = 'ocular' | 'non_ocular'

export type QuoteStatus =
  | 'pending'
  | 'active'
  | 'quoted'
  | 'awaiting_payment'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type Product = {
  id: number
  name: string
  slug: string
  category: string
  short_description: string
  description: string
  approx_price: string
  specifications: Record<string, string>
  sort_order: number
  is_active: boolean
}

export type CartItem = {
  product_id: number
  name: string
  slug: string
  category: string
  subtitle: string
  approx_price: number
  quantity: number
}

export type QuoteItem = {
  id: number
  product_id: number | null
  product_name: string
  quantity: number
  approx_unit_price: string
  final_unit_price: string | null
  line_approx: string
  line_final: string | null
}

export type MediaFile = {
  id: number
  kind: 'layout_image' | 'site_video'
  original_name: string
  mime_type: string
  size: number
  url: string
}

export type Note = {
  id: number
  author_name: string
  body: string
  created_at: string
}

export type ScheduleEvent = {
  id: number
  quote_request_id: number
  reference_code: string | null
  customer_name: string | null
  location: string | null
  technician_id: number
  technician_name: string | null
  event_type: 'ocular' | 'installation'
  starts_at: string
  ends_at: string
  notes: string | null
}

export type Warranty = {
  id: number
  starts_at: string
  ends_at: string
  status: 'active' | 'expired'
}

export type StatusEvent = {
  id: number
  from_status: QuoteStatus | null
  to_status: QuoteStatus
  actor_name: string
  created_at: string
}

export type QuoteSummary = {
  id: number
  reference_code: string
  customer_name: string
  customer_phone: string
  location: string
  inspection_type: InspectionType
  status: QuoteStatus
  items_count: number
  approx_total: string
  quoted_total: string | null
  created_at: string
}

export type QuoteDetail = QuoteSummary & {
  customer_email: string
  message: string | null
  down_payment_percent: number
  down_payment_amount: string | null
  down_payment_received_at: string | null
  installation_start_date: string | null
  installation_end_date: string | null
  assigned_technician_id: number | null
  assigned_technician_name: string | null
  items: QuoteItem[]
  media: MediaFile[]
  notes: Note[]
  schedules: ScheduleEvent[]
  warranty: Warranty | null
  status_events: StatusEvent[]
}

export type Technician = {
  id: number
  name: string
  phone: string | null
  email: string | null
  specialty: string | null
  is_active: boolean
}

export type StaffUser = {
  id: number
  name: string
  email: string
  role: string
}

export const statusLabel: Record<QuoteStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  quoted: 'Quoted',
  awaiting_payment: 'Awaiting 70%',
  scheduled: 'Scheduled',
  in_progress: 'Installing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const quoteStatuses: QuoteStatus[] = [
  'pending',
  'active',
  'quoted',
  'awaiting_payment',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
]
