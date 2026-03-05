export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') ?? ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!bearerToken) {
    throw createError({ statusCode: 401, statusMessage: 'Missing access token' })
  }

  const { user, supabase } = await requireUser(bearerToken)

  const body = await readBody<{ outlookEventId: string }>(event)
  if (!body?.outlookEventId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing outlookEventId' })
  }

  let accessToken: string
  try {
    accessToken = await ensureValidMicrosoftToken(supabase, user.id)
  } catch {
    return { deleted: false, reason: 'not_connected' }
  }

  try {
    await $fetch(
      `https://graph.microsoft.com/v1.0/me/events/${body.outlookEventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
  } catch {
    // Evento pode já ter sido deletado
  }

  return { deleted: true }
})
