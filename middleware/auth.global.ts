export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const publicRoutes = ['/login', '/registro', '/confirmar-email', '/confirmar-presenca', '/redefinir-senha']
  const isPublic = publicRoutes.some(r => to.path === r || to.path.startsWith(r + '/'))

  const { user, initialize, ensureProfile, isAdmin, bootstrapAdmin } = useAuth()

  // A4: try-catch para não quebrar navegação se auth falhar
  try {
    await initialize()
  } catch (e) {
    console.error('[middleware] Falha ao inicializar autenticação:', e)
    if (!isPublic) {
      return navigateTo('/login')
    }
    return
  }

  // Usuário logado tentando acessar página pública → redireciona
  // A5: /confirmar-email não redireciona (usuário recém-registrado precisa ver a página)
  if (isPublic && user.value) {
    if (to.path === '/login' || to.path === '/registro') {
      const returnTo = to.query.returnTo as string
      if (returnTo) {
        return navigateTo(returnTo)
      }
      await ensureProfile()
      return navigateTo(isAdmin.value ? '/admin' : '/')
    }
    return
  }

  // Página pública → permite acesso
  if (isPublic) return

  // Sem usuário → redireciona para login
  if (!user.value) {
    return navigateTo('/login')
  }

  // Rota /admin → exige role admin
  if (to.path.startsWith('/admin')) {
    // Garante que o profile está carregado antes de verificar role
    await ensureProfile()
    if (!isAdmin.value) {
      // tenta bootstrap admin e revalida
      await bootstrapAdmin()
      await ensureProfile()
    }
    if (!isAdmin.value) {
      return navigateTo('/')
    }
  }
})
