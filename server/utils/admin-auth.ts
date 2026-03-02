import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const getAdminClient = () => {
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

const requireAdmin = async (supabase: SupabaseClient, token: string) => {
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single() as { data: { role: string } | null; error: any }

  if (profileError || profile?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })
  }

  return userData.user
}

export { getAdminClient, requireAdmin }
