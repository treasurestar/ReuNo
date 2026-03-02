import type { SupabaseClient } from "@supabase/supabase-js";

export const useSupabase = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$supabase as SupabaseClient;
};
