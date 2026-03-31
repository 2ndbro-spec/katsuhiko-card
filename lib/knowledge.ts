import 'server-only'
import { supabase } from './supabase'

export interface KnowledgeEntry {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export async function fetchAllEntries(): Promise<KnowledgeEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createEntry(title: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('knowledge_entries')
    .insert({ title, content })

  if (error) throw error
}

export async function updateEntry(id: string, title: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('knowledge_entries')
    .update({ title, content })
    .eq('id', id)

  if (error) throw error
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('knowledge_entries')
    .delete()
    .eq('id', id)

  if (error) throw error
}
