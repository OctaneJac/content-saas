"use client"

import { useState, useEffect } from "react"
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import type { Column, Card } from "@/lib/database.types"
import { getBoard, reorderCards } from "@/app/actions/board-actions"
import { useToast } from "@/hooks/use-toast"

interface KanbanBoardProps {
  boardId: string
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([])
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const fetchBoard = async () => {
    setIsLoading(true)
    try {
      const result = await getBoard(boardId)
      if ("columns" in result) {
        setColumns(result.columns)
        setError(null)
      } else {
        setError(result.error || "Failed to load board")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBoard()
  }, [boardId])

  const handleDragStart = (event: any) => {
    const { active } = event
    if (active.data.current?.type === "card") {
      setActiveCard(active.data.current.card)
    }
  }

  const handleDragOver = (event: any) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    // If the active item is not a card or we're not dragging over anything, return
    if (active.data.current?.type !== "card") return

    // Find the active column (where the dragged card is from)
    const activeColumn = columns.find((col) => col.cards.some((card) => card.id === activeId))

    // If we can't find the column, return
    if (!activeColumn) return

    // Check if we're dragging over a card or a column
    if (over.data.current?.type === "card") {
      // We're dragging over another card
      const overColumn = columns.find((col) => col.cards.some((card) => card.id === overId))
      if (!overColumn) return

      // Get the active and over card indices
      const activeCardIndex = activeColumn.cards.findIndex((card) => card.id === activeId)
      const overCardIndex = overColumn.cards.findIndex((card) => card.id === overId)

      // If we're dragging within the same column
      if (activeColumn.id === overColumn.id) {
        const newCards = arrayMove(activeColumn.cards, activeCardIndex, overCardIndex)

        // Update the columns state
        setColumns((prev) =>
          prev.map((col) => {
            if (col.id === activeColumn.id) {
              return { ...col, cards: newCards }
            }
            return col
          }),
        )
      } else {
        // We're dragging to a different column
        // Remove the card from the active column
        const newActiveCards = [...activeColumn.cards]
        const [movedCard] = newActiveCards.splice(activeCardIndex, 1)

        // Add the card to the new column
        const newOverCards = [...overColumn.cards]
        newOverCards.splice(overCardIndex, 0, { ...movedCard, column_id: overColumn.id })

        // Update the columns state
        setColumns((prev) =>
          prev.map((col) => {
            if (col.id === activeColumn.id) {
              return { ...col, cards: newActiveCards }
            }
            if (col.id === overColumn.id) {
              return { ...col, cards: newOverCards }
            }
            return col
          }),
        )
      }
    } else if (over.data.current?.type === "column") {
      // We're dragging over a column
      const overColumn = columns.find((col) => col.id === overId)
      if (!overColumn) return

      // If we're already in this column, return
      if (activeColumn.id === overColumn.id) return

      // Remove the card from the active column
      const activeCardIndex = activeColumn.cards.findIndex((card) => card.id === activeId)
      const newActiveCards = [...activeColumn.cards]
      const [movedCard] = newActiveCards.splice(activeCardIndex, 1)

      // Add the card to the new column at the end
      const newOverCards = [...overColumn.cards, { ...movedCard, column_id: overColumn.id }]

      // Update the columns state
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === activeColumn.id) {
            return { ...col, cards: newActiveCards }
          }
          if (col.id === overColumn.id) {
            return { ...col, cards: newOverCards }
          }
          return col
        }),
      )
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (!over) {
      setActiveCard(null)
      return
    }

    // Prepare updates for the database
    const updates: { id: string; column_id: string; order: number }[] = []

    columns.forEach((column) => {
      column.cards.forEach((card, index) => {
        updates.push({
          id: card.id,
          column_id: column.id,
          order: index,
        })
      })
    })

    // Reset the active card
    setActiveCard(null)

    // Update the database
    try {
      const result = await reorderCards(updates)
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to save card order",
          variant: "destructive",
        })
        // Refresh the board to get the current state
        fetchBoard()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      // Refresh the board to get the current state
      fetchBoard()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading board...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive">{error}</p>
        <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md" onClick={fetchBoard}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 h-full">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} onCardAdded={fetchBoard} onCardUpdated={fetchBoard} />
        ))}
      </div>
      <DragOverlay>{activeCard && <KanbanCard card={activeCard} />}</DragOverlay>
    </DndContext>
  )
}
