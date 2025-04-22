"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getCardById, updateCard } from "@/app/actions/board-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageUploader } from "@/components/image-uploader"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import type { Card as CardType } from "@/lib/database.types"

export default function CardPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [card, setCard] = useState<CardType | null>(null)
  const [title, setTitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [script, setScript] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchCard = async () => {
      if (params.id) {
        const cardData = await getCardById(params.id as string)
        if (cardData) {
          setCard(cardData)
          setTitle(cardData.title)
          setImageUrl(cardData.image_url || "")
          setScript(cardData.script || "")
        }
        setIsLoading(false)
      }
    }

    fetchCard()
  }, [params.id])

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for the card",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const result = await updateCard(params.id as string, {
        title,
        image_url: imageUrl || undefined,
        script: script || undefined,
      })

      if (result.success) {
        toast({
          title: "Card updated",
          description: "The card has been updated successfully",
        })
        // Update local state
        if (result.card) {
          setCard(result.card)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update card",
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
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    router.push("/board")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <p>Loading card...</p>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl mb-4">Card not found</p>
        <Button onClick={handleBack}>Back to Board</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Board
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-semibold"
                  placeholder="Card Title"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Thumbnail</label>
                <ImageUploader value={imageUrl} onChange={setImageUrl} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Script</h2>
        <RichTextEditor content={script} onChange={setScript} placeholder="Write your script here..." />
      </div>
    </div>
  )
}
