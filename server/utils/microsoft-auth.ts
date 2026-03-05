import type { SupabaseClient } from '@supabase/supabase-js'

export const getMicrosoftConfig = () => {
  const config = useRuntimeConfig()
  return {
    clientId: config.public.microsoftClientId as string,
    clientSecret: config.microsoftClientSecret as string,
    tenantId: config.microsoftTenantId as string,
  }
}

/**
 * Busca o token do usuário e faz refresh se expirado (buffer de 5 min).
 * Retorna o access_token válido para Microsoft Graph.
 */
export const ensureValidMicrosoftToken = async (
  supabase: SupabaseClient<any, any, any>,
  userId: string
): Promise<string> => {
  const { data: tokenData, error } = await supabase
    .from('outlook_calendar_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single()

  if (error || !tokenData) {
    throw createError({ statusCode: 404, statusMessage: 'Outlook Calendar não conectado' })
  }

  const expiresAt = new Date(tokenData.expires_at)
  const bufferMs = 5 * 60 * 1000

  // Token ainda válido
  if (expiresAt.getTime() - Date.now() > bufferMs) {
    return tokenData.access_token
  }

  // Refresh necessário
  const ms = getMicrosoftConfig()
  const refreshResponse = await $fetch<{
    access_token: string
    refresh_token?: string
    expires_in: number
  }>(`https://login.microsoftonline.com/${ms.tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: ms.clientId,
      client_secret: ms.clientSecret,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token',
      scope: 'offline_access Calendars.ReadWrite',
    }).toString(),
  })

  if (!refreshResponse.access_token) {
    throw createError({ statusCode: 502, statusMessage: 'Microsoft token refresh failed' })
  }

  const newExpiresAt = new Date(Date.now() + refreshResponse.expires_in * 1000).toISOString()

  // Microsoft pode rotacionar refresh tokens — salvar novo se retornado
  const updatePayload: Record<string, string> = {
    access_token: refreshResponse.access_token,
    expires_at: newExpiresAt,
  }
  if (refreshResponse.refresh_token) {
    updatePayload.refresh_token = refreshResponse.refresh_token
  }

  await supabase
    .from('outlook_calendar_tokens')
    .update(updatePayload)
    .eq('user_id', userId)

  return refreshResponse.access_token
}
