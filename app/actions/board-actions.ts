"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { Column, Card } from "@/lib/database.types"

// Get all columns with cards for a board
export async function getBoard(boardId: string) {
  try {
    // Get columns
    const { data: columns, error: columnsError } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("order", { ascending: true })

    if (columnsError) {
      throw new Error(`Error fetching columns: ${columnsError.message}`)
    }

    // Get cards for each column
    const columnsWithCards: Column[] = []

    for (const column of columns) {
      const { data: cards, error: cardsError } = await supabase
        .from("cards")
        .select("*")
        .eq("column_id", column.id)
        .order("order", { ascending: true })

      if (cardsError) {
        throw new Error(`Error fetching cards for column ${column.id}: ${cardsError.message}`)
      }

      columnsWithCards.push({
        ...column,
        cards: cards || [],
      })
    }

    return { columns: columnsWithCards }
  } catch (error) {
    console.error("Error getting board:", error)
    return { error: "Failed to fetch board data" }
  }
}

// Get a single board by ID
export async function getBoardById(boardId: string) {
  try {
    const { data, error } = await supabase.from("boards").select("*").eq("id", boardId).single()

    if (error) {
      throw new Error(`Error fetching board: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error getting board by ID:", error)
    return null
  }
}

// Get a single card by ID
export async function getCardById(cardId: string): Promise<Card | null> {
  try {
    const { data, error } = await supabase.from("cards").select("*").eq("id", cardId).single()

    if (error) {
      throw new Error(`Error fetching card: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error getting card by ID:", error)
    return null
  }
}

// Create a new card
export async function createCard(columnId: string, title: string, description?: string, imageUrl?: string) {
  try {
    // Get the highest order in the column
    const { data: cards, error: orderError } = await supabase
      .from("cards")
      .select("order")
      .eq("column_id", columnId)
      .order("order", { ascending: false })
      .limit(1)

    if (orderError) {
      throw new Error(`Error getting highest order: ${orderError.message}`)
    }

    const order = cards && cards.length > 0 ? cards[0].order + 1 : 0

    // Create the card
    const { data, error } = await supabase
      .from("cards")
      .insert({
        column_id: columnId,
        title,
        description,
        image_url: imageUrl,
        script: null,
        order,
      })
      .select()

    if (error) {
      throw new Error(`Error creating card: ${error.message}`)
    }

    revalidatePath("/board")
    return { success: true, card: data[0] }
  } catch (error) {
    console.error("Error creating card:", error)
    return { success: false, error: "Failed to create card" }
  }
}

// Update a card
export async function updateCard(
  cardId: string,
  updates: {
    title?: string
    description?: string
    image_url?: string
    script?: string
    column_id?: string
    order?: number
  },
) {
  try {
    const { data, error } = await supabase.from("cards").update(updates).eq("id", cardId).select()

    if (error) {
      throw new Error(`Error updating card: ${error.message}`)
    }

    revalidatePath(`/card/${cardId}`)
    revalidatePath("/board")
    return { success: true, card: data[0] }
  } catch (error) {
    console.error("Error updating card:", error)
    return { success: false, error: "Failed to update card" }
  }
}

// Delete a card
export async function deleteCard(cardId: string) {
  try {
    const { error } = await supabase.from("cards").delete().eq("id", cardId)

    if (error) {
      throw new Error(`Error deleting card: ${error.message}`)
    }

    revalidatePath("/board")
    return { success: true }
  } catch (error) {
    console.error("Error deleting card:", error)
    return { success: false, error: "Failed to delete card" }
  }
}

// Move a card to a different column or position
export async function moveCard(cardId: string, destinationColumnId: string, newOrder: number) {
  try {
    // Update the card with new column and order
    const { data, error } = await supabase
      .from("cards")
      .update({
        column_id: destinationColumnId,
        order: newOrder,
      })
      .eq("id", cardId)
      .select()

    if (error) {
      throw new Error(`Error moving card: ${error.message}`)
    }

    revalidatePath("/board")
    return { success: true, card: data[0] }
  } catch (error) {
    console.error("Error moving card:", error)
    return { success: false, error: "Failed to move card" }
  }
}

// Reorder cards after a drag and drop operation
export async function reorderCards(updates: { id: string; column_id: string; order: number }[]) {
  try {
    for (const update of updates) {
      const { error } = await supabase
        .from("cards")
        .update({ column_id: update.column_id, order: update.order })
        .eq("id", update.id)

      if (error) {
        throw new Error(`Error reordering card ${update.id}: ${error.message}`)
      }
    }

    revalidatePath("/board")
    return { success: true }
  } catch (error) {
    console.error("Error reordering cards:", error)
    return { success: false, error: "Failed to reorder cards" }
  }
}

// Get all boards
export async function getAllBoards() {
  try {
    const { data, error } = await supabase.from("boards").select("*").order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Error fetching boards: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error getting all boards:", error)
    return []
  }
}

// Create a new board with default columns
export async function createBoard(title: string, description: string | null, ownerId: string) {
  try {
    // Create the board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .insert({
        title,
        description,
        owner_id: ownerId,
      })
      .select()

    if (boardError) {
      throw new Error(`Error creating board: ${boardError.message}`)
    }

    const boardId = board[0].id

    // Add the user as a board member
    const { error: memberError } = await supabase.from("board_members").insert({
      board_id: boardId,
      user_id: ownerId,
      role: "owner",
    })

    if (memberError) {
      throw new Error(`Error adding board member: ${memberError.message}`)
    }

    // Create default columns
    const defaultColumns = [
      { title: "Discarded", order: 0 },
      { title: "Ideating", order: 1 },
      { title: "Scripting", order: 2 },
      { title: "Recording", order: 3 },
      { title: "Editing", order: 4 },
      { title: "Published", order: 5 },
    ]

    for (const column of defaultColumns) {
      const { error: columnError } = await supabase.from("columns").insert({
        board_id: boardId,
        title: column.title,
        order: column.order,
      })

      if (columnError) {
        throw new Error(`Error creating column ${column.title}: ${columnError.message}`)
      }
    }

    revalidatePath("/board")
    return { success: true, boardId }
  } catch (error: any) {
    console.error("Error creating board:", error)
    return { success: false, message: error.message || "Failed to create board" }
  }
}
