import type { User } from '@supabase/supabase-js'
import type { Profile } from '~/types/database'

// Flag global para evitar múltiplos listeners
const listenerRegistered = ref(false)
// Lock para evitar inicialização concorrente
let initPromise: Promise<void> | null = null

export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null)
  const profile = useState<Profile | null>('auth-profile', () => null)
  const loading = useState('auth-loading', () => true)
  const initialized = useState('auth-initialized', () => false)
  const adminBootstrapUserId = useState<string | null>('auth-admin-bootstrap-user', () => null)
  const adminBootstrapState = useState<'idle' | 'checking' | 'ok' | 'denied' | 'error'>('auth-admin-bootstrap-state', () => 'idle')
  const adminBootstrapReason = useState<string | null>('auth-admin-bootstrap-reason', () => null)

  const fetchProfile = async () => {
    if (!user.value) {
      profile.value = null
      return
    }
    try {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      if (error) {
        console.warn('[auth] Erro ao buscar perfil:', error.message)
        profile.value = null
        return
      }
      profile.value = data as Profile
    } catch (e) {
      console.warn('[auth] Exceção ao buscar perfil:', e)
      profile.value = null
    }
  }

  const maybeBootstrapAdmin = async () => {
    if (!user.value) return
    if (adminBootstrapUserId.value === user.value.id) return
    if (profile.value?.role === 'admin') return

    adminBootstrapUserId.value = user.value.id
    adminBootstrapState.value = 'checking'
    adminBootstrapReason.value = null

    try {
      const supabase = useSupabase()
      // Valida user server-side antes de usar o token
      const { data: { user: validated }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !validated) {
        adminBootstrapState.value = 'error'
        adminBootstrapReason.value = 'invalid_user'
        return
      }
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        adminBootstrapState.value = 'error'
        adminBootstrapReason.value = 'missing_token'
        return
      }

      const res = await $fetch<{ ok: boolean; reason?: string }>('/api/admin/bootstrap', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res?.ok) {
        adminBootstrapState.value = 'ok'
      } else {
        adminBootstrapState.value = 'denied'
        adminBootstrapReason.value = res?.reason ?? 'not_allowed'
      }

      await fetchProfile()
    } catch (e) {
      console.warn('[auth] Falha ao promover admin:', e)
      adminBootstrapState.value = 'error'
      adminBootstrapReason.value = 'request_failed'
    }
  }

  const bootstrapAdmin = async () => {
    adminBootstrapUserId.value = null
    await maybeBootstrapAdmin()
    return {
      state: adminBootstrapState.value,
      reason: adminBootstrapReason.value,
    }
  }

  const initialize = async () => {
    if (initialized.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      const supabase = useSupabase()

      try {
        const { data: { user: validatedUser }, error } = await supabase.auth.getUser()

        if (error || !validatedUser) {
          user.value = null
          profile.value = null
        } else {
          user.value = validatedUser
          await fetchProfile()
          await maybeBootstrapAdmin()
        }
      } catch (e) {
        console.warn('[auth] Falha ao inicializar:', e)
        user.value = null
        profile.value = null
      } finally {
        loading.value = false
        initialized.value = true
        initPromise = null
      }

      // Registra listener apenas uma vez
      if (!listenerRegistered.value) {
        listenerRegistered.value = true
        supabase.auth.onAuthStateChange(async (_event, session) => {
          const previousUser = user.value
          user.value = session?.user ?? null

          if (user.value && user.value.id !== previousUser?.id) {
            await fetchProfile()
          } else if (!user.value) {
            profile.value = null
          }
        })
      }
    })()

    return initPromise
  }

  // Chamado após login/signup para recarregar user + profile antes de navegar
  const revalidate = async () => {
    const supabase = useSupabase()
    try {
      const { data: { user: validatedUser }, error } = await supabase.auth.getUser()
      if (error || !validatedUser) {
        user.value = null
        profile.value = null
      } else {
        user.value = validatedUser
        await fetchProfile()
        await maybeBootstrapAdmin()
      }
    } catch (e) {
      console.warn('[auth] Falha ao revalidar:', e)
    }
  }

  // Garante que o profile está carregado (retry se necessário)
  const ensureProfile = async () => {
    if (profile.value) return
    if (!user.value) return
    await fetchProfile()
  }

  const signOut = async () => {
    try {
      const supabase = useSupabase()
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('[auth] Erro ao fazer logout:', e)
    }
    user.value = null
    profile.value = null
    initialized.value = false
    adminBootstrapUserId.value = null
    adminBootstrapState.value = 'idle'
    adminBootstrapReason.value = null
    navigateTo('/login')
  }

  const isAdmin = computed(() => profile.value?.role === 'admin')

  return {
    user,
    profile,
    loading,
    initialized,
    initialize,
    revalidate,
    ensureProfile,
    signOut,
    fetchProfile,
    isAdmin,
    bootstrapAdmin,
    adminBootstrapState,
    adminBootstrapReason,
  }
}
