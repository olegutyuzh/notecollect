'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export interface CollectibleEditData {
  title: string
  issuer_name: string | null
  min_year: number | null
  max_year: number | null
  category_code: string
  country_id: number | null
}

async function assertAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const profileRes = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const data = profileRes.data as { role: string } | null
  if (data?.role !== 'admin') throw new Error('Not authorized')
}

export async function updateCollectible(id: number, data: CollectibleEditData) {
  await assertAdmin()
  const admin = createAdminSupabaseClient()
  const { error } = await admin.from('collectibles').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/collectibles')
}

export async function deleteCollectible(id: number) {
  await assertAdmin()
  const admin = createAdminSupabaseClient()
  const { error } = await admin.from('collectibles').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/collectibles')
}
