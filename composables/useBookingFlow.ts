export interface RecurrenceData {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  daysOfWeek: number[]
  endType: 'date' | 'occurrences'
  endDate: string
  maxOccurrences: number
}

export interface BookingData {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  duration: number
  expectedParticipants: number
  invitedEmails: string
  notifications: number[]
  recurrence: RecurrenceData
}

export const useBookingFlow = () => {
  const defaultRecurrence: RecurrenceData = {
    enabled: false,
    frequency: 'weekly',
    daysOfWeek: [],
    endType: 'occurrences',
    endDate: '',
    maxOccurrences: 10,
  }

  const data = useState<BookingData>('booking-flow', () => ({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 60,
    expectedParticipants: 3,
    invitedEmails: '',
    notifications: [],
    recurrence: { ...defaultRecurrence },
  }))

  const step = useState<number>('booking-step', () => 1)

  const reset = () => {
    data.value = {
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      duration: 60,
      expectedParticipants: 3,
      invitedEmails: '',
      notifications: [],
      recurrence: { ...defaultRecurrence },
    }
    step.value = 1
  }

  const calcEndTime = (start: string, minutes: number): string => {
    const [h, m] = start.split(':').map(Number)
    const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  return { data, step, reset, calcEndTime }
}
