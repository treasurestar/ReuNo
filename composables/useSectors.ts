import type { Sector, Position } from '~/types/database'

interface SectorWithCount extends Sector {
  user_count: number
}

export const useSectors = () => {
  const sectors = useState<Sector[]>('sectors', () => [])
  const positions = useState<Position[]>('positions', () => [])
  const supabase = useSupabase()

  const fetchAll = async (): Promise<Sector[]> => {
    const { data } = await supabase
      .from('sectors')
      .select('*')
      .order('name')
    sectors.value = (data as Sector[]) || []
    return sectors.value
  }

  const fetchWithUserCount = async (): Promise<SectorWithCount[]> => {
    const { data: sectorData } = await supabase
      .from('sectors')
      .select('*')
      .order('name')

    const allSectors = (sectorData as Sector[]) || []

    const { data: profileData } = await supabase
      .from('profiles')
      .select('sector_id')
      .not('sector_id', 'is', null)

    const counts: Record<string, number> = {}
    if (profileData) {
      for (const p of profileData) {
        const sid = (p as { sector_id: string }).sector_id
        counts[sid] = (counts[sid] || 0) + 1
      }
    }

    return allSectors.map(s => ({
      ...s,
      user_count: counts[s.id] || 0,
    }))
  }

  const create = async (name: string, description?: string): Promise<{ data: Sector | null; error: string | null }> => {
    const trimmed = name.trim()
    if (!trimmed) return { data: null, error: 'Nome do setor é obrigatório.' }

    const existing = sectors.value.find(s => s.name.toLowerCase() === trimmed.toLowerCase())
    if (existing) return { data: null, error: 'Já existe um setor com esse nome.' }

    const { data, error } = await supabase
      .from('sectors')
      .insert({ name: trimmed, description: description?.trim() || null })
      .select()
      .single()

    if (error) return { data: null, error: error.message }
    return { data: data as Sector, error: null }
  }

  const update = async (id: string, updates: { name?: string; description?: string }): Promise<{ error: string | null }> => {
    const payload: Record<string, string | null> = {}
    if (updates.name !== undefined) {
      const trimmed = updates.name.trim()
      if (!trimmed) return { error: 'Nome do setor é obrigatório.' }
      payload.name = trimmed
    }
    if (updates.description !== undefined) {
      payload.description = updates.description.trim() || null
    }

    const { error } = await supabase
      .from('sectors')
      .update(payload)
      .eq('id', id)

    if (error) return { error: error.message }
    return { error: null }
  }

  const remove = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('sectors')
      .delete()
      .eq('id', id)

    if (error) return { error: error.message }
    return { error: null }
  }

  const assignUserToSector = async (userId: string, sectorId: string | null): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('profiles')
      .update({ sector_id: sectorId, position_id: null })
      .eq('id', userId)

    if (error) return { error: error.message }
    return { error: null }
  }

  // --- Positions (cargos) ---

  const fetchPositions = async (): Promise<Position[]> => {
    const { data } = await supabase
      .from('positions')
      .select('*')
      .order('name')
    positions.value = (data as Position[]) || []
    return positions.value
  }

  const positionsForSector = (sectorId: string): Position[] => {
    return positions.value.filter(p => p.sector_id === sectorId)
  }

  const createPosition = async (sectorId: string, name: string): Promise<{ data: Position | null; error: string | null }> => {
    const trimmed = name.trim()
    if (!trimmed) return { data: null, error: 'Nome do cargo é obrigatório.' }

    const existing = positions.value.find(
      p => p.sector_id === sectorId && p.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (existing) return { data: null, error: 'Já existe um cargo com esse nome neste setor.' }

    const { data, error } = await supabase
      .from('positions')
      .insert({ sector_id: sectorId, name: trimmed })
      .select()
      .single()

    if (error) return { data: null, error: error.message }
    return { data: data as Position, error: null }
  }

  const removePosition = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('id', id)

    if (error) return { error: error.message }
    return { error: null }
  }

  const assignUserPosition = async (userId: string, positionId: string | null): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('profiles')
      .update({ position_id: positionId })
      .eq('id', userId)

    if (error) return { error: error.message }
    return { error: null }
  }

  return {
    sectors, fetchAll, fetchWithUserCount, create, update, remove, assignUserToSector,
    positions, fetchPositions, positionsForSector, createPosition, removePosition, assignUserPosition,
  }
}
