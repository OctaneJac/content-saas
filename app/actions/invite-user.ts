"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"

export async function inviteUser(email: string) {
  try {
    // Check if user already exists
    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .single()

    if (lookupError && lookupError.code !== "PGRST116") {
      throw new Error("Error checking for existing user")
    }

    if (existingUser) {
      // User already exists, we could add them to a board here
      return { success: true, message: "User already exists and can be added to boards" }
    }

    // Generate a name from the email
    const name = email
      .split("@")[0]
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")

    // Create a new user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email,
        name,
        avatar_url: null, // We'll use initials as a fallback
      })
      .select()

    if (createError) {
      throw new Error(`Error creating user: ${createError.message}`)
    }

    revalidatePath("/")
    return { success: true, message: `Invitation sent to ${email}` }
  } catch (error: any) {
    console.error("Error inviting user:", error)
    return {
      success: false,
      message: error.message || "Failed to invite user. Please try again.",
    }
  }
}
