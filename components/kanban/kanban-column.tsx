"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanCard } from "./kanban-card"
import type { Column } from "@/lib/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createCard } from "@/app/actions/board-actions"
import { useToast } from "@/hooks/use-toast"
import { ImageUploader } from "@/components/image-uploader"

interface KanbanColumnProps {
  column: Column
  onCardAdded?: () => void
  onCardUpdated?: () => void
}

export function KanbanColumn({ column, onCardAdded, onCardUpdated }: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  })

  const handleAddCard = async () => {
    if (!title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for the card",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await createCard(column.id, title, description || undefined, imageUrl || undefined)

      if (result.success) {
        toast({
          title: "Card added",
          description: "The card has been added successfully",
        })
        setIsAddingCard(false)
        setTitle("")
        setDescription("")
        setImageUrl("")
        if (onCardAdded) {
          onCardAdded()
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add card",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="px-3 py-2 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddingCard(true)}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add card</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-3">
          <div ref={setNodeRef} className="min-h-full">
            <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
              {column.cards.map((card) => (
                <KanbanCard key={card.id} card={card} onCardUpdated={onCardUpdated} />
              ))}
            </SortableContext>
          </div>
        </CardContent>
      </Card>

      {/* Add Card Dialog */}
      <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUploader value={imageUrl} onChange={setImageUrl} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCard(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCard} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
