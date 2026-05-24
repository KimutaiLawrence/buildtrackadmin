import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return format(new Date(date), 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return format(new Date(date), 'MMM d, yyyy HH:mm')
  } catch {
    return '—'
  }
}

export function formatRelative(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatTier(tier: string): string {
  const map: Record<string, string> = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
  }
  return map[tier] || tier
}

export function formatBytes(mb: number): string {
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}
