import type { Meeting, MeetingSeries, MeetingParticipant, Profile } from '~/types/database'

export const useMeetings = () => {
  const supabase = useSupabase()

  const fetchByMonth = async (year: number, month: number) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
    const { data } = await supabase
      .from('meetings')
      .select('date, status')
      .gte('date', startDate)
      .lte('date', endDate)
      .neq('status', 'cancelled')
    return (data ?? []) as { date: string; status: string }[]
  }

  const fetchByDate = async (date: string) => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*, creator:profiles!created_by(*), meeting_participants(*)')
      .eq('date', date)
      .neq('status', 'cancelled')
      .order('start_time')
    return { data: (data ?? []) as Meeting[], error }
  }

  const fetchToday = async () => {
    const today = new Date().toLocaleDateString('en-CA')
    return fetchByDate(today)
  }

  const fetchMyMeetings = async (userId: string) => {
    const { data: created } = await supabase
      .from('meetings')
      .select('*, creator:profiles!created_by(*), meeting_participants(*, profile:profiles!user_id(*))')
      .eq('created_by', userId)
      .neq('status', 'cancelled')
      .order('date')
      .order('start_time')

    const { data: participating } = await supabase
      .from('meeting_participants')
      .select('meeting_id, meetings:meeting_id(*, creator:profiles!created_by(*), meeting_participants(*, profile:profiles!user_id(*)))')
      .eq('user_id', userId)
      .neq('status', 'cancelled')

    const all = [...(created ?? [])] as Meeting[]
    const fromParticipation = (participating ?? [])
      .map((p: any) => p.meetings)
      .filter(Boolean) as Meeting[]

    for (const m of fromParticipation) {
      if (!all.find(e => e.id === m.id)) all.push(m)
    }

    all.sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time))
    return all
  }

  const fetchInvites = async (userId: string) => {
    const { data } = await supabase
      .from('meeting_participants')
      .select('*, meetings:meeting_id(*, creator:profiles!created_by(*))')
      .eq('user_id', userId)
      .eq('status', 'pending')
    return (data ?? []) as (MeetingParticipant & { meetings: Meeting })[]
  }

  const create = async (meeting: {
    title: string
    description?: string
    date: string
    start_time: string
    end_time: string
    duration_minutes: number
    expected_participants: number
    created_by: string
  }) => {
    // Validações client-side antes de enviar ao banco
    if (!meeting.title.trim()) {
      return { data: null, error: { message: 'Título é obrigatório.' } }
    }
    if (!meeting.date) {
      return { data: null, error: { message: 'Data é obrigatória.' } }
    }
    const today = new Date().toLocaleDateString('en-CA')
    if (meeting.date < today) {
      return { data: null, error: { message: 'Não é possível agendar em datas passadas.' } }
    }
    if (!meeting.start_time || !meeting.end_time) {
      return { data: null, error: { message: 'Horário inicial e final são obrigatórios.' } }
    }
    if (meeting.start_time >= meeting.end_time) {
      return { data: null, error: { message: 'Horário final deve ser posterior ao inicial.' } }
    }
    if (meeting.duration_minutes <= 0) {
      return { data: null, error: { message: 'Duração inválida.' } }
    }
    if (meeting.expected_participants <= 0) {
      return { data: null, error: { message: 'Número de participantes inválido.' } }
    }

    const { data, error } = await supabase
      .from('meetings')
      .insert(meeting)
      .select()
      .single()

    // Traduz erros comuns do banco para o usuário
    if (error) {
      const msg = error.message?.toLowerCase() ?? ''
      if (msg.includes('overlap') || msg.includes('sobreposição')) {
        return { data: null, error: { message: 'Já existe uma reunião neste horário. Escolha outro slot.' } }
      }
      if (msg.includes('room_hours') || msg.includes('horário de funcionamento')) {
        return { data: null, error: { message: 'Horário fora do expediente da sala.' } }
      }
      if (msg.includes('weekend') || msg.includes('fim de semana')) {
        return { data: null, error: { message: 'Reservas em fins de semana não são permitidas.' } }
      }
      return { data: null, error: { message: error.message || 'Erro ao criar reunião.' } }
    }

    return { data: data as Meeting | null, error: null }
  }

  const addParticipants = async (
    meetingId: string,
    participants: { user_id?: string; guest_name?: string; guest_email?: string; is_organizer?: boolean }[]
  ) => {
    const rows = participants.map(p => ({ meeting_id: meetingId, ...p }))
    return supabase.from('meeting_participants').insert(rows).select()
  }

  const addNotifications = async (meetingId: string, date: string, startTime: string, minutesBefore: number[]) => {
    const dt = new Date(`${date}T${startTime}`)
    const rows = minutesBefore.map(min => ({
      meeting_id: meetingId,
      minutes_before: min,
      scheduled_for: new Date(dt.getTime() - min * 60000).toISOString(),
    }))
    return supabase.from('meeting_notifications').insert(rows).select()
  }

  const cancel = async (meetingId: string, userId: string) => {
    return supabase
      .from('meetings')
      .update({ status: 'cancelled' as const, cancelled_by: userId, cancelled_at: new Date().toISOString() })
      .eq('id', meetingId)
      .select()
      .single()
  }

  const cancelParticipation = async (participantId: string) => {
    return supabase
      .from('meeting_participants')
      .update({ status: 'cancelled' as const, cancelled_at: new Date().toISOString() })
      .eq('id', participantId)
      .select()
      .single()
  }

  const confirmParticipation = async (participantId: string) => {
    return supabase
      .from('meeting_participants')
      .update({ status: 'confirmed' as const, confirmed_at: new Date().toISOString() })
      .eq('id', participantId)
      .select()
      .single()
  }

  const declineParticipation = async (participantId: string) => {
    return supabase
      .from('meeting_participants')
      .update({ status: 'declined' as const })
      .eq('id', participantId)
      .select()
      .single()
  }

  const confirmGuest = async (token: string, guestName?: string) => {
    const { data, error } = await supabase.rpc('confirm_guest_presence', {
      p_token: token,
      p_guest_name: guestName ?? null,
    })
    return { data, error }
  }

  const confirmByMeetingToken = async (token: string, params: { userId?: string; guestName?: string; guestEmail?: string }) => {
    const { data, error } = await supabase.rpc('confirm_meeting_presence', {
      p_meeting_token: token,
      p_user_id: params.userId ?? null,
      p_guest_name: params.guestName ?? null,
      p_guest_email: params.guestEmail ?? null,
    })
    return { data, error }
  }

  const fetchStats = async () => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    const weekStartStr = weekStart.toLocaleDateString('en-CA')
    const todayStr = now.toLocaleDateString('en-CA')

    const { data: weekly } = await supabase
      .from('meetings')
      .select('duration_minutes, status')
      .gte('date', weekStartStr)
      .lte('date', todayStr)

    const active = (weekly ?? []).filter(m => m.status !== 'cancelled')
    const totalHours = Math.round(active.reduce((s, m) => s + m.duration_minutes, 0) / 60)
    const cancellations = (weekly ?? []).filter(m => m.status === 'cancelled').length

    const { data: todayM } = await supabase
      .from('meetings')
      .select('duration_minutes')
      .eq('date', todayStr)
      .neq('status', 'cancelled')

    const todayMin = (todayM ?? []).reduce((s, m) => s + m.duration_minutes, 0)

    // E3: Calcular minutos disponíveis a partir da config da sala
    const { data: roomCfg } = await supabase
      .from('room_config')
      .select('open_time, close_time')
      .eq('id', 1)
      .single()

    let availableMinutes = 11 * 60 // fallback: 11 horas
    if (roomCfg?.open_time && roomCfg?.close_time) {
      const [openH, openM] = roomCfg.open_time.split(':').map(Number)
      const [closeH, closeM] = roomCfg.close_time.split(':').map(Number)
      const calc = (closeH * 60 + closeM) - (openH * 60 + openM)
      if (calc > 0) availableMinutes = calc
    }
    const occupancy = Math.round((todayMin / availableMinutes) * 100)

    return { totalHours, cancellations, occupancy }
  }

  const fetchAllUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('full_name')
    return (data ?? []) as Profile[]
  }

  const removeUserFromMeeting = async (participantId: string) => {
    return supabase.from('meeting_participants').delete().eq('id', participantId)
  }

  const fetchAllMeetings = async (filters?: { status?: string; dateFrom?: string; dateTo?: string }) => {
    let query = supabase
      .from('meetings')
      .select('*, creator:profiles!created_by(*), meeting_participants(*)')
      .order('date', { ascending: false })
      .order('start_time', { ascending: false })
      .limit(100)

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.dateFrom) {
      query = query.gte('date', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('date', filters.dateTo)
    }

    const { data } = await query
    return (data ?? []) as Meeting[]
  }

  const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
    return supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()
  }

  const deleteUser = async (userId: string) => {
    return supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
  }

  const fetchMonthlyStats = async () => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA')
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('en-CA')

    const { data: monthly, count: totalUsers } = await supabase
      .from('meetings')
      .select('duration_minutes, status')
      .gte('date', monthStart)
      .lte('date', monthEnd)

    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const totalMeetings = (monthly ?? []).filter(m => m.status !== 'cancelled').length
    const totalCancelled = (monthly ?? []).filter(m => m.status === 'cancelled').length

    return { totalMeetings, totalCancelled, totalUsers: userCount ?? 0 }
  }

  // ── Recorrência ──────────────────────────────────────────

  const generateOccurrenceDates = (opts: {
    startDate: string
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
    daysOfWeek: number[]
    endType: 'date' | 'occurrences'
    endDate: string
    maxOccurrences: number
    allowWeekends: boolean
  }): string[] => {
    const dates: string[] = []
    const cap = Math.min(opts.maxOccurrences || 52, 52)
    const start = new Date(opts.startDate + 'T12:00:00')
    const endLimit = opts.endType === 'date' && opts.endDate
      ? new Date(opts.endDate + 'T12:00:00')
      : null

    // Limit iterations to prevent infinite loops
    const maxIterations = 365 * 2

    if (opts.frequency === 'daily') {
      const cursor = new Date(start)
      for (let i = 0; i < maxIterations && dates.length < cap; i++) {
        const dateStr = cursor.toLocaleDateString('en-CA')
        if (endLimit && cursor > endLimit) break
        const dow = cursor.getDay()
        if (opts.allowWeekends || (dow !== 0 && dow !== 6)) {
          dates.push(dateStr)
        }
        cursor.setDate(cursor.getDate() + 1)
      }
    } else if (opts.frequency === 'weekly' || opts.frequency === 'biweekly') {
      const interval = opts.frequency === 'biweekly' ? 2 : 1
      const days = opts.daysOfWeek.length ? opts.daysOfWeek : [start.getDay()]
      const weekCursor = new Date(start)
      // Align to Monday of the start week
      const mondayOffset = (weekCursor.getDay() + 6) % 7
      weekCursor.setDate(weekCursor.getDate() - mondayOffset)

      for (let w = 0; w < maxIterations && dates.length < cap; w++) {
        for (const dayNum of days.sort((a, b) => a - b)) {
          if (dates.length >= cap) break
          const d = new Date(weekCursor)
          // dayNum: 0=dom..6=sab → offset from Monday
          const offset = dayNum === 0 ? 6 : dayNum - 1
          d.setDate(weekCursor.getDate() + offset)
          const dateStr = d.toLocaleDateString('en-CA')
          if (dateStr < opts.startDate) continue
          if (endLimit && d > endLimit) break
          const dow = d.getDay()
          if (!opts.allowWeekends && (dow === 0 || dow === 6)) continue
          dates.push(dateStr)
        }
        if (endLimit && weekCursor > endLimit) break
        weekCursor.setDate(weekCursor.getDate() + 7 * interval)
      }
    } else if (opts.frequency === 'monthly') {
      const dayOfMonth = start.getDate()
      const cursor = new Date(start)
      for (let i = 0; i < maxIterations && dates.length < cap; i++) {
        // Set to the correct day-of-month (skip if invalid, e.g. Feb 31)
        const year = cursor.getFullYear()
        const month = cursor.getMonth()
        const maxDay = new Date(year, month + 1, 0).getDate()
        if (dayOfMonth <= maxDay) {
          cursor.setDate(dayOfMonth)
          const dateStr = cursor.toLocaleDateString('en-CA')
          if (endLimit && cursor > endLimit) break
          if (dateStr >= opts.startDate) {
            const dow = cursor.getDay()
            if (opts.allowWeekends || (dow !== 0 && dow !== 6)) {
              dates.push(dateStr)
            }
          }
        }
        cursor.setMonth(cursor.getMonth() + 1)
      }
    }

    return dates
  }

  const createSeries = async (opts: {
    frequency: string
    daysOfWeek: number[]
    interval: number
    endDate: string | null
    maxOccurrences: number | null
    createdBy: string
  }) => {
    const { data, error } = await supabase
      .from('meeting_series')
      .insert({
        frequency: opts.frequency,
        days_of_week: opts.daysOfWeek,
        recurrence_interval: opts.interval,
        ends_at: opts.endDate || null,
        max_occurrences: opts.maxOccurrences || null,
        created_by: opts.createdBy,
      })
      .select()
      .single()
    return { data: data as MeetingSeries | null, error }
  }

  const createWithSeries = async (opts: {
    meetingBase: {
      title: string
      description?: string
      start_time: string
      end_time: string
      duration_minutes: number
      expected_participants: number
      created_by: string
    }
    dates: string[]
    seriesConfig: {
      frequency: string
      daysOfWeek: number[]
      interval: number
      endDate: string | null
      maxOccurrences: number | null
    }
  }) => {
    const created: Meeting[] = []
    const skipped: string[] = []

    // Check conflicts for each date
    for (const date of opts.dates) {
      const { data: existing } = await fetchByDate(date)
      const conflict = existing.some(m => {
        return opts.meetingBase.start_time < m.end_time && opts.meetingBase.end_time > m.start_time
      })
      if (conflict) {
        skipped.push(date)
      }
    }

    const validDates = opts.dates.filter(d => !skipped.includes(d))
    if (validDates.length === 0) {
      return { created: [], skipped, series: null, error: { message: 'Todas as datas possuem conflito de horário.' } }
    }

    // Create the series
    const { data: series, error: seriesError } = await createSeries({
      frequency: opts.seriesConfig.frequency,
      daysOfWeek: opts.seriesConfig.daysOfWeek,
      interval: opts.seriesConfig.interval,
      endDate: opts.seriesConfig.endDate,
      maxOccurrences: opts.seriesConfig.maxOccurrences,
      createdBy: opts.meetingBase.created_by,
    })

    if (seriesError || !series) {
      return { created: [], skipped, series: null, error: seriesError }
    }

    // Create each meeting in the series
    for (const date of validDates) {
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          ...opts.meetingBase,
          date,
          series_id: series.id,
        })
        .select()
        .single()

      if (!meetingError && meeting) {
        created.push(meeting as Meeting)
      } else {
        skipped.push(date)
      }
    }

    return { created, skipped, series, error: null }
  }

  const cancelSeries = async (seriesId: string, userId: string) => {
    const today = new Date().toLocaleDateString('en-CA')
    const { data, error } = await supabase
      .from('meetings')
      .update({
        status: 'cancelled' as const,
        cancelled_by: userId,
        cancelled_at: new Date().toISOString(),
      })
      .eq('series_id', seriesId)
      .eq('status', 'scheduled')
      .gte('date', today)
      .select()

    return { cancelled: (data ?? []).length, error }
  }

  const rescheduleMeeting = async (meetingId: string, newDate: string, startTime: string, endTime: string) => {
    // Check conflicts on the new date
    const { data: existing } = await fetchByDate(newDate)
    const conflict = existing.some(m => {
      if (m.id === meetingId) return false
      return startTime < m.end_time && endTime > m.start_time
    })
    if (conflict) {
      return { data: null, error: { message: 'Já existe uma reunião neste horário na nova data.' } }
    }

    const { data, error } = await supabase
      .from('meetings')
      .update({ date: newDate })
      .eq('id', meetingId)
      .select()
      .single()

    return { data: data as Meeting | null, error }
  }

  const fetchSeriesMeetings = async (seriesId: string) => {
    const { data } = await supabase
      .from('meetings')
      .select('*, creator:profiles!created_by(*)')
      .eq('series_id', seriesId)
      .order('date')
      .order('start_time')
    return (data ?? []) as Meeting[]
  }

  return {
    fetchByMonth, fetchByDate, fetchToday, fetchMyMeetings, fetchInvites,
    create, addParticipants, addNotifications,
    cancel, cancelParticipation, confirmParticipation, declineParticipation,
    confirmGuest, confirmByMeetingToken, fetchStats, fetchAllUsers, removeUserFromMeeting,
    fetchAllMeetings, updateUserRole, deleteUser, fetchMonthlyStats,
    generateOccurrenceDates, createSeries, createWithSeries, cancelSeries, rescheduleMeeting, fetchSeriesMeetings,
  }
}
