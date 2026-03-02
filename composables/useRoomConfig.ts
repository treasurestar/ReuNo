import type { RoomConfig } from '~/types/database'

export const useRoomConfig = () => {
  const config = useState<RoomConfig | null>('room-config', () => null)
  const loading = ref(false)

  const fetch = async () => {
    if (config.value) return config.value
    loading.value = true
    const supabase = useSupabase()
    const { data } = await supabase
      .from('room_config')
      .select('*')
      .eq('id', 1)
      .single()
    config.value = data as RoomConfig | null
    loading.value = false
    return config.value
  }

  const updateConfig = async (updates: Partial<Omit<RoomConfig, 'id'>>) => {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('room_config')
      .update(updates)
      .eq('id', 1)
      .select()
      .single()
    if (data) config.value = data as RoomConfig
    return { data, error }
  }

  return { config, loading, fetch, updateConfig }
}
