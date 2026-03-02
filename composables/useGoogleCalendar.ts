export const useGoogleCalendar = () => {
  const connected = useState<boolean>('gcal-connected', () => false)
  const loading = useState<boolean>('gcal-loading', () => false)
  const error = useState<string | null>('gcal-error', () => null)

  const config = useRuntimeConfig()
  const supabase = useSupabase()

  /** Verifica se o usuário tem Google Calendar conectado */
  const checkConnection = async () => {
    const { data } = await supabase
      .from('google_calendar_tokens')
      .select('user_id')
      .maybeSingle()

    connected.value = Boolean(data?.user_id)
    return connected.value
  }

  /** Inicia o fluxo OAuth — redireciona para Google */
  const connect = () => {
    const clientId = config.public.googleClientId
    if (!clientId) {
      error.value = 'Google Client ID não configurado'
      return
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.events',
      access_type: 'offline',
      prompt: 'consent',
    })

    sessionStorage.setItem('gcal-return-to', window.location.pathname)
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
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

      const redirectUri = `${window.location.origin}/auth/google/callback`

      await $fetch('/api/google/exchange-token', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { code, redirectUri },
      })

      connected.value = true
      return true
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Falha ao conectar Google Calendar'
      return false
    } finally {
      loading.value = false
    }
  }

  /** Desconecta Google Calendar */
  const disconnect = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) return

      await $fetch('/api/google/disconnect', {
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

  /** Cria evento no Google Calendar (non-fatal) */
  const createEvent = async (meeting: {
    meetingId: string
    title: string
    description?: string
    date: string
    startTime: string
    endTime: string
  }): Promise<{ eventId: string; htmlLink: string } | null> => {
    if (!connected.value) return null

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) return null

      return await $fetch<{ eventId: string; htmlLink: string }>(
        '/api/google/create-event',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: meeting,
        },
      )
    } catch (e: any) {
      console.warn('[gcal] Falha ao criar evento:', e?.message)
      return null
    }
  }

  /** Deleta evento do Google Calendar (non-fatal) */
  const deleteEvent = async (googleEventId: string) => {
    if (!connected.value || !googleEventId) return

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) return

      await $fetch('/api/google/delete-event', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { googleEventId },
      })
    } catch (e: any) {
      console.warn('[gcal] Falha ao deletar evento:', e?.message)
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
