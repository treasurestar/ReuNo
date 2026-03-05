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

  const accessToken = await ensureValidMicrosoftToken(supabase, user.id)

  const timezone = 'America/Sao_Paulo'
  const startTime = body.startTime.length === 5 ? `${body.startTime}:00` : body.startTime
  const endTime = body.endTime.length === 5 ? `${body.endTime}:00` : body.endTime

  const calendarEvent = await $fetch<{ id: string; webLink: string }>(
    'https://graph.microsoft.com/v1.0/me/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: {
        subject: body.title,
        body: {
          contentType: 'text',
          content: body.description || 'Reunião agendada via Reunô',
        },
        start: {
          dateTime: `${body.date}T${startTime}`,
          timeZone: timezone,
        },
        end: {
          dateTime: `${body.date}T${endTime}`,
          timeZone: timezone,
        },
        reminderMinutesBeforeStart: 10,
      },
    },
  )

  if (calendarEvent?.id) {
    await supabase
      .from('meetings')
      .update({
        outlook_event_id: calendarEvent.id,
        sync_outlook: true,
      })
      .eq('id', body.meetingId)
  }

  return {
    eventId: calendarEvent.id,
    webLink: calendarEvent.webLink,
  }
})
