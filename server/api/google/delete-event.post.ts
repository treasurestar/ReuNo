export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') ?? ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!bearerToken) {
    throw createError({ statusCode: 401, statusMessage: 'Missing access token' })
  }

  const { user, supabase } = await requireUser(bearerToken)

  const body = await readBody<{ googleEventId: string }>(event)
  if (!body?.googleEventId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing googleEventId' })
  }

  // Obter access_token válido
  let accessToken: string
  try {
    accessToken = await ensureValidToken(supabase, user.id)
  } catch {
    // Não conectado — nada a fazer
    return { deleted: false, reason: 'not_connected' }
  }

  // Deletar evento do Google Calendar (non-fatal)
  try {
    await $fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${body.googleEventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
  } catch {
    // Evento pode já ter sido deletado — não é erro fatal
  }

  return { deleted: true }
})
