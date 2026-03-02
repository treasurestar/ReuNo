import { getAdminClient, requireAdmin } from '../../utils/admin-auth'

interface Body {
  email: string
  full_name: string
  role?: 'admin' | 'user'
  password: string
}

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing access token' })
  }

  const body = await readBody<Body>(event)
  if (!body?.email || !body?.full_name || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const supabase = getAdminClient()
  await requireAdmin(supabase, token)

  const { data: created, error: createErrorMsg } = await supabase.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { full_name: body.full_name },
  })

  if (createErrorMsg || !created?.user) {
    throw createError({ statusCode: 500, statusMessage: createErrorMsg?.message ?? 'Failed to create user' })
  }

  const role = body.role === 'admin' ? 'admin' : 'user'

  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: created.user.id,
      full_name: body.full_name,
      email: body.email.toLowerCase(),
      role,
    }, { onConflict: 'id' })

  if (upsertError) {
    throw createError({ statusCode: 500, statusMessage: upsertError.message })
  }

  return { ok: true }
})
