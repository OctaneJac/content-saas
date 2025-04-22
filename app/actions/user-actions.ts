"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createUser(name: string, email: string) {
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
      return {
        success: true,
        message: "User already exists",
        userId: existingUser.id,
      }
    }

    // Create a new user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email,
        name,
        avatar_url: null,
      })
      .select()

    if (createError) {
      throw new Error(`Error creating user: ${createError.message}`)
    }

    revalidatePath("/board")
    return {
      success: true,
      message: "User created successfully",
      userId: newUser[0].id,
    }
  } catch (error: any) {
    console.error("Error creating user:", error)
    return {
      success: false,
      message: error.message || "Failed to create user. Please try again.",
    }
  }
}

export async function getCurrentUser() {
  try {
    // For simplicity, we'll just get the first user
    // In a real app, you would use authentication to get the current user
    const { data, error } = await supabase.from("users").select("*").limit(1).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching current user:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
