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
