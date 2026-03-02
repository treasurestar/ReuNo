export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') ?? ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!bearerToken) {
    throw createError({ statusCode: 401, statusMessage: 'Missing access token' })
  }

  const { user, supabase } = await requireUser(bearerToken)

  // Buscar token para revogar
  const { data: tokenData } = await supabase
    .from('google_calendar_tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .single()

  // Revogar com Google (best-effort)
  if (tokenData?.access_token) {
    try {
      await $fetch(`https://oauth2.googleapis.com/revoke?token=${tokenData.access_token}`, {
        method: 'POST',
      })
    } catch {
      // Ignorar erros de revogação
    }
  }

  // Deletar do banco
  await supabase
    .from('google_calendar_tokens')
    .delete()
    .eq('user_id', user.id)

  return { disconnected: true }
})
