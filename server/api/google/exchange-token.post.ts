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

  const google = getGoogleConfig()

  // Trocar authorization code por tokens
  const tokenResponse = await $fetch<{
    access_token: string
    refresh_token?: string
    expires_in: number
    token_type: string
    scope: string
  }>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: {
      code: body.code,
      client_id: google.clientId,
      client_secret: google.clientSecret,
      redirect_uri: body.redirectUri,
      grant_type: 'authorization_code',
    },
  })

  if (!tokenResponse.access_token) {
    throw createError({ statusCode: 502, statusMessage: 'Google token exchange failed' })
  }

  if (!tokenResponse.refresh_token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No refresh token received. Revogue o acesso em myaccount.google.com e tente novamente.',
    })
  }

  const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()

  const { error: upsertError } = await supabase
    .from('google_calendar_tokens')
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
