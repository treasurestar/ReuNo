export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') ?? ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!bearerToken) {
    throw createError({ statusCode: 401, statusMessage: 'Missing access token' })
  }

  const { user, supabase } = await requireUser(bearerToken)

  const body = await readBody<{
    meetingId: string
    title: string
    description?: string
    date: string
    startTime: string
    endTime: string
  }>(event)

  if (!body?.meetingId || !body?.title || !body?.date || !body?.startTime || !body?.endTime) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // Obter access_token válido (com refresh automático)
  const accessToken = await ensureValidToken(supabase, user.id)

  // Criar evento no Google Calendar
  const timezone = 'America/Sao_Paulo'
  const startTime = body.startTime.length === 5 ? `${body.startTime}:00` : body.startTime
  const endTime = body.endTime.length === 5 ? `${body.endTime}:00` : body.endTime

  const calendarEvent = await $fetch<{ id: string; htmlLink: string }>(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: {
        summary: body.title,
        description: body.description || 'Reunião agendada via Reunô',
        start: {
          dateTime: `${body.date}T${startTime}`,
          timeZone: timezone,
        },
        end: {
          dateTime: `${body.date}T${endTime}`,
          timeZone: timezone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 10 },
          ],
        },
      },
    },
  )

  // Atualizar meeting com google_event_id
  if (calendarEvent?.id) {
    await supabase
      .from('meetings')
      .update({
        google_event_id: calendarEvent.id,
        sync_google: true,
      })
      .eq('id', body.meetingId)
  }

  return {
    eventId: calendarEvent.id,
    htmlLink: calendarEvent.htmlLink,
  }
})
