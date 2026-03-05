export interface Sector {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Position {
  id: string
  sector_id: string
  name: string
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: 'admin' | 'user'
  sector_id: string | null
  sector?: Sector
  position_id: string | null
  position?: Position
  created_at: string
  updated_at: string
}

export interface RoomConfig {
  id: number
  name: string
  min_participants: number
  max_capacity: number
  open_time: string
  close_time: string
  timezone: string
  allow_weekends: boolean
  amenities: string[]
  updated_at: string
}

export interface MeetingSeries {
  id: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  days_of_week: number[]
  recurrence_interval: number
  ends_at: string | null
  max_occurrences: number | null
  created_by: string
  created_at: string
}

export interface Meeting {
  id: string
  series_id: string | null
  title: string
  description: string | null
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  expected_participants: number
  actual_participants: number | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  created_by: string
  cancelled_by: string | null
  cancelled_at: string | null
  sync_outlook: boolean
  outlook_event_id: string | null
  invite_token?: string
  created_at: string
  updated_at: string
  creator?: Profile
  meeting_participants?: MeetingParticipant[]
}

export interface MeetingParticipant {
  id: string
  meeting_id: string
  user_id: string | null
  guest_name: string | null
  guest_email: string | null
  invite_token: string
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled'
  is_organizer: boolean
  confirmed_at: string | null
  cancelled_at: string | null
  created_at: string
  profile?: Profile
}

export interface OutlookCalendarToken {
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  created_at: string
  updated_at: string
}

export interface MeetingNotification {
  id: string
  meeting_id: string
  minutes_before: number
  scheduled_for: string
  sent: boolean
  sent_at: string | null
  created_at: string
}
