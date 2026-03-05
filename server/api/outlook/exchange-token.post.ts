export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing access token' })
  }

  const { user, supabase } = await requireUser(token)

  const body = await readBody<{ code: string; redirectUri: string }>(event)
  if (!body?.code || !body?.redirectUri) {
    throw createError({ statusCode: 400, statusMessage: 'Missing code or redirectUri' })
  }

  const ms = getMicrosoftConfig()

  const tokenResponse = await $fetch<{
    access_token: string
    refresh_token?: string
    expires_in: number
    token_type: string
    scope: string
  }>(`https://login.microsoftonline.com/${ms.tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: ms.clientId,
      client_secret: ms.clientSecret,
      code: body.code,
      redirect_uri: body.redirectUri,
      grant_type: 'authorization_code',
      scope: 'offline_access Calendars.ReadWrite',
    }).toString(),
  })

  if (!tokenResponse.access_token) {
    throw createError({ statusCode: 502, statusMessage: 'Microsoft token exchange failed' })
  }

  if (!tokenResponse.refresh_token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No refresh token received. Verifique as permissões do app no Azure.',
    })
  }

  const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()

  const { error: upsertError } = await supabase
    .from('outlook_calendar_tokens')
    .upsert({
      user_id: user.id,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_at: expiresAt,
    }, { onConflict: 'user_id' })

  if (upsertError) {
    throw createError({ statusCode: 500, statusMessage: upsertError.message })
  }

  return { connected: true }
})
