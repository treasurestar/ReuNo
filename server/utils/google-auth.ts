import { createClient } from '@supabase/supabase-js'

export const getServiceClient = () => {
  const config = useRuntimeConfig()
  const serviceKey = config.supabaseServiceRoleKey
  const supabaseUrl = config.public.supabaseUrl

  if (!serviceKey || !supabaseUrl) {
    throw createError({ statusCode: 500, statusMessage: 'Server auth not configured' })
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}

export const requireUser = async (token: string) => {
  const supabase = getServiceClient()
  const { data: userData, error } = await supabase.auth.getUser(token)
  if (error || !userData?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
  }
  return { user: userData.user, supabase }
}

export const getGoogleConfig = () => {
  const config = useRuntimeConfig()
  return {
    clientId: config.public.googleClientId as string,
    clientSecret: config.googleClientSecret as string,
  }
}

/**
 * Busca o token do usuário e faz refresh se expirado (buffer de 5 min).
 * Retorna o access_token válido.
 */
export const ensureValidToken = async (
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string> => {
  const { data: tokenData, error } = await supabase
    .from('google_calendar_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single()

  if (error || !tokenData) {
    throw createError({ statusCode: 404, statusMessage: 'Google Calendar não conectado' })
  }

  const expiresAt = new Date(tokenData.expires_at)
  const bufferMs = 5 * 60 * 1000

  // Token ainda válido
  if (expiresAt.getTime() - Date.now() > bufferMs) {
    return tokenData.access_token
  }

  // Refresh necessário
  const google = getGoogleConfig()
  const refreshResponse = await $fetch<{
    access_token: string
    expires_in: number
  }>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: {
      refresh_token: tokenData.refresh_token,
      client_id: google.clientId,
      client_secret: google.clientSecret,
      grant_type: 'refresh_token',
    },
  })

  if (!refreshResponse.access_token) {
    throw createError({ statusCode: 502, statusMessage: 'Google token refresh failed' })
  }

  const newExpiresAt = new Date(Date.now() + refreshResponse.expires_in * 1000).toISOString()

  await supabase
    .from('google_calendar_tokens')
    .update({
      access_token: refreshResponse.access_token,
      expires_at: newExpiresAt,
    })
    .eq('user_id', userId)

  return refreshResponse.access_token
}
