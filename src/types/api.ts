export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface AdminStats {
  total_developers: number
  total_projects: number
  total_buyers: number
  uploads_this_week: number
  flagged_uploads: number
}

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise'
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled'

export interface Developer {
  id: string
  company_name: string
  contact_person_name: string
  contact_phone: string
  email: string
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  trial_ends_at: string | null
  project_count: number
  created_at: string
  updated_at: string
}

export type ProjectStatus = 'pending' | 'in_progress' | 'complete' | 'delayed'

export interface Project {
  id: string
  developer_id: string
  developer_name: string
  name: string
  location: string
  total_units: number
  buyer_count: number
  milestone_count: number
  completed_milestones: number
  status: ProjectStatus
  created_at: string
}

export interface Milestone {
  id: string
  project_id: string
  name: string
  order: number
  is_complete: boolean
  completed_at: string | null
}

export interface Buyer {
  id: string
  full_name: string
  email: string
  project_id: string
  project_name: string
  developer_id: string
  developer_name: string
  invitation_status: 'pending' | 'accepted'
  created_at: string
  last_login_at: string | null
}

export type UploadFanoutStatus = 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed'

export interface Upload {
  id: string
  project_id: string
  project_name: string
  developer_id: string
  developer_name: string
  milestone_id: string
  milestone_name: string
  photo_count: number
  gps_lat: number | null
  gps_lng: number | null
  gps_distance_meters: number | null
  is_flagged: boolean
  flag_reason: string | null
  flag_reviewed: boolean
  fanout_status: UploadFanoutStatus
  created_at: string
}

export interface UploadPhoto {
  id: string
  url: string
  thumbnail_url: string
}

export interface NotificationLog {
  id: string
  recipient_email: string
  recipient_name: string
  channel: 'email' | 'sms' | 'push'
  template: string
  status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed'
  provider: string
  sent_at: string | null
  delivered_at: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string
  actor_email: string
  actor_role: 'admin' | 'developer' | 'buyer'
  action: string
  entity_type: string
  entity_id: string
  developer_id: string | null
  developer_name: string | null
  ip_address: string
  created_at: string
}

export interface Subscription {
  id: string
  developer_id: string
  developer_name: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  emails_used: number
  storage_used_mb: number
  created_at: string
}
