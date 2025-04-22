"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createUser } from "@/app/actions/user-actions"

interface AccountSetupProps {
  onComplete: (userId: string) => void
}

export function AccountSetup({ onComplete }: AccountSetupProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !email.includes("@")) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid name and email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await createUser(name, email)

      if (result.success && result.userId) {
        toast({
          title: "Account created",
          description: "Your account has been set up successfully",
        })
        onComplete(result.userId)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create account",
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up Your Account</CardTitle>
        <CardDescription>Create an account to start using the Kanban board</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </CardFooter>
    </Card>
  )
}
