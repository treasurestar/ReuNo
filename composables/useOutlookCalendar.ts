export const useOutlookCalendar = () => {
  const connected = useState<boolean>('outlook-connected', () => false)
  const loading = useState<boolean>('outlook-loading', () => false)
  const error = useState<string | null>('outlook-error', () => null)

  const config = useRuntimeConfig()
  const supabase = useSupabase()

  /** Verifica se o usuário tem Outlook Calendar conectado */
  const checkConnection = async () => {
    const { data } = await supabase
      .from('outlook_calendar_tokens')
      .select('user_id')
      .maybeSingle()

    connected.value = Boolean(data?.user_id)
    return connected.value
  }

  /** Inicia o fluxo OAuth — redireciona para Microsoft */
  const connect = () => {
    const clientId = config.public.microsoftClientId
    console.log('[outlook] connect() chamado, clientId:', clientId ? 'presente' : 'VAZIO')
    if (!clientId) {
      error.value = 'Microsoft Client ID não configurado'
      return
    }

    const redirectUri = `${window.location.origin}/auth/outlook/callback`
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'offline_access Calendars.ReadWrite',
      response_mode: 'query',
      prompt: 'consent',
    })

    sessionStorage.setItem('outlook-return-to', window.location.pathname)
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
  }

  /** Troca o authorization code por tokens (chamado pelo callback) */
  const exchangeCode = async (code: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        error.value = 'Não autenticado'
        return false
      }

      const redirectUri = `${window.location.origin}/auth/outlook/callback`

      await $fetch('/api/outlook/exchange-token', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { code, redirectUri },
      })

      connected.value = true
      return true
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Falha ao conectar Outlook Calendar'
      return false
    } finally {
      loading.value = false
    }
  }

  /** Desconecta Outlook Calendar */
  const disconnect = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) return

      await $fetch('/api/outlook/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      connected.value = false
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Falha ao desconectar'
    } finally {
      loading.value = false
    }
  }

  /** Cria evento no Outlook Calendar (non-fatal) */
  const createEvent = async (meeting: {
    meetingId: string
    title: string
    description?: string
    date: string
    startTime: string
    endTime: string
  }): Promise<{ eventId: string; webLink: string } | null> => {
    if (!connected.value) return null

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) return null

      return await $fetch<{ eventId: string; webLink: string }>(
        '/api/outlook/create-event',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: meeting,
        },
      )
    } catch (e: any) {
      console.warn('[outlook] Falha ao criar evento:', e?.message)
      return null
    }
  }

  /** Deleta evento do Outlook Calendar (non-fatal) */
  const deleteEvent = async (outlookEventId: string) => {
    if (!connected.value || !outlookEventId) return

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) return

      await $fetch('/api/outlook/delete-event', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { outlookEventId },
      })
    } catch (e: any) {
      console.warn('[outlook] Falha ao deletar evento:', e?.message)
    }
  }

  return {
    connected: readonly(connected),
    loading: readonly(loading),
    error: readonly(error),
    checkConnection,
    connect,
    exchangeCode,
    disconnect,
    createEvent,
    deleteEvent,
  }
}
