"use client"

import { useState, useEffect } from "react"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { getAllBoards } from "@/app/actions/board-actions"
import { getCurrentUser } from "@/app/actions/user-actions"
import { AccountSetup } from "@/components/account-setup"
import { CreateBoard } from "@/components/create-board"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BoardPage() {
  const [boards, setBoards] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeBoard, setActiveBoard] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Get current user
      const user = await getCurrentUser()
      setCurrentUser(user)

      // Get all boards
      const boardsData = await getAllBoards()
      setBoards(boardsData)

      // Set active board if available
      if (boardsData.length > 0) {
        setActiveBoard(boardsData[0].id)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleUserCreated = (userId: string) => {
    setCurrentUser({ id: userId })
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  // If no user is found, show the account setup form
  if (!currentUser) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to Clutch</h1>
          <p className="text-muted-foreground mt-2">Let's get you set up first</p>
        </div>

        <AccountSetup onComplete={handleUserCreated} />
      </main>
    )
  }

  // If no boards are found, show the create board form
  if (boards.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Your First Board</h1>
          <p className="text-muted-foreground mt-2">Set up a board to start tracking your content</p>
        </div>

        <CreateBoard userId={currentUser.id} />
      </main>
    )
  }

  // If we have boards, show the board view
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Creation Board</h1>
        <p className="text-muted-foreground mt-2">Track your content from ideation to publication</p>
      </div>

      {boards.length > 1 && (
        <Tabs value={activeBoard || boards[0].id} onValueChange={setActiveBoard} className="mb-6">
          <TabsList>
            {boards.map((board) => (
              <TabsTrigger key={board.id} value={board.id}>
                {board.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="h-[calc(100vh-200px)]">{activeBoard && <KanbanBoard boardId={activeBoard} />}</div>
    </main>
  )
}
