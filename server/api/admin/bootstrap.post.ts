import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing access token' })
  }

  const config = useRuntimeConfig()
  const serviceKey = config.supabaseServiceRoleKey
  const supabaseUrl = config.public.supabaseUrl
  const adminEmailsRaw = config.adminEmails

  if (!serviceKey || !supabaseUrl) {
    throw createError({ statusCode: 500, statusMessage: 'Server auth not configured' })
  }

  const adminEmails = adminEmailsRaw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (adminEmails.length === 0) {
    return { ok: false, reason: 'no_admin_allowlist' }
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
  }

  const user = userData.user
  const email = (user.email ?? '').toLowerCase()
  if (!email || !adminEmails.includes(email)) {
    return { ok: false, reason: 'not_allowed' }
  }

  const fullName =
    (user.user_metadata?.full_name as string | undefined)
    ?? (user.user_metadata?.name as string | undefined)
    ?? email.split('@')[0]

  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: fullName,
      email,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      role: 'admin',
    }, { onConflict: 'id' })

  if (upsertError) {
    throw createError({ statusCode: 500, statusMessage: upsertError.message })
  }

  return { ok: true }
})
