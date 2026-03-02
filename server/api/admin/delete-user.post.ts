import { getAdminClient, requireAdmin } from '../../utils/admin-auth'

interface Body {
  userId: string
}

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing access token' })
  }

  const body = await readBody<Body>(event)
  if (!body?.userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing userId' })
  }

  const supabase = getAdminClient()
  await requireAdmin(supabase, token)

  const { error } = await supabase.auth.admin.deleteUser(body.userId)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
