import { supabase } from '@/lib/supabase'

export async function fetchWizardData (uid) {
  const { data } = await fetch(`/api/get-plan?user_id=${uid}`).then(r=>r.json())
  return data || { hasData:false }
}

export async function fetchUserUsage (uid, tier='starter') {
  const { data } = await supabase.rpc('get_user_usage_stats',{ p_user_id:uid })
  const tierLimits = { starter:50, professional:200, enterprise:999_999 }
  return {
    currentMonth: data?.[0]?.ideas_this_month || 0,
    limit: tierLimits[tier] ?? 50
  }
}

export async function fetchSavedIdeas (uid) {
  const { data } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('user_id',uid)
        .order('created_at',{ ascending:false })
  return data || []
}

/* ---- local helpers copied from your old file ---- */
export const parseKeywords = str => { /* … */ }
export const parseHashtags = str => { /* … */ }
export const calcContentScore = idea => { /* … */ }
