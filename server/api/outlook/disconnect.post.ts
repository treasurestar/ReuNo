export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') ?? ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!bearerToken) {
    throw createError({ statusCode: 401, statusMessage: 'Missing access token' })
  }

  const { user, supabase } = await requireUser(bearerToken)

  // Microsoft não tem revoke endpoint simples como Google.
  // Deletamos os tokens do banco. O usuário pode revogar manualmente em:
  // https://account.live.com/consent/Manage ou no portal Azure AD.
  await supabase
    .from('outlook_calendar_tokens')
    .delete()
    .eq('user_id', user.id)

  return { disconnected: true }
})
