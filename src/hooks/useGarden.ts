import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { GardenArtifact } from '../types'

export function useGarden() {
  const [artifacts, setArtifacts] = useState<GardenArtifact[]>([])
  const [loading, setLoading] = useState(true)

  // ── Fetch ────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('garden_artifacts')
      .select('*')
      .order('placed_at', { ascending: true })
      .then(({ data }) => {
        if (data) setArtifacts(data as GardenArtifact[])
        setLoading(false)
      })
  }, [])

  // ── Realtime subscription ──────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('garden-artifacts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'garden_artifacts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as GardenArtifact
            setArtifacts(prev => prev.some(a => a.id === row.id) ? prev : [...prev, row])
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id: string }).id
            setArtifacts(prev => prev.filter(a => a.id !== oldId))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Create artifact ──────────────────────────────────────
  const createArtifact = useCallback(async (artifact: {
    artifact_type: GardenArtifact['artifact_type']
    item_id?: string | null
    template_id?: string | null
    variant?: number
    tier?: number
    name?: string
  }) => {
    const { data } = await supabase
      .from('garden_artifacts')
      .insert({
        artifact_type: artifact.artifact_type,
        item_id: artifact.item_id ?? null,
        template_id: artifact.template_id ?? null,
        variant: artifact.variant ?? 0,
        tier: artifact.tier ?? 1,
        name: artifact.name ?? '',
      })
      .select()
      .single()

    if (data) {
      setArtifacts(prev => [...prev, data as GardenArtifact])
    }
  }, [])

  return { artifacts, loading, createArtifact }
}
