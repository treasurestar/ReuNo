import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const supabaseUrl = config.public.supabaseUrl as string;
  const supabaseAnonKey = config.public.supabaseAnonKey as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[supabase] SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios. Configure no .env"
    );
    // Cria um client dummy que sempre falha, evitando crash silencioso
    const dummyClient = {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Supabase não configurado' } }),
        getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase não configurado' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase não configurado' } }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase não configurado' } }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithOAuth: () => Promise.resolve({ data: { url: null, provider: null }, error: { message: 'Supabase não configurado' } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        resetPasswordForEmail: () => Promise.resolve({ data: {}, error: { message: 'Supabase não configurado' } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }), order: () => ({ limit: () => Promise.resolve({ data: [], error: { message: 'Supabase não configurado' } }) }) }) }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }) }) }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase não configurado' } }) }),
      }),
      rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
    } as unknown as SupabaseClient;

    return { provide: { supabase: dummyClient } };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });

  return {
    provide: {
      supabase,
    },
  };
});
