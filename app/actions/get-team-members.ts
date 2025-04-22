"use server"

import { supabase } from "@/lib/supabase"

export async function getTeamMembers() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, avatar_url")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching team members:", error.message)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error getting team members:", error)
    return []
  }
}
