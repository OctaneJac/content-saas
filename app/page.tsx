import { Suspense } from "react"
import WelcomeHeader from "@/components/welcome-header"
import InviteUsers from "@/components/invite-users"
import TeamMembers from "@/components/team-members"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <WelcomeHeader />
        <div className="flex gap-2">
          <Link href="/board">
            <Button>View Kanban Board</Button>
          </Link>
        </div>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Loading team members...</div>}>
          <TeamMembers />
        </Suspense>
        <InviteUsers />
      </div>
    </main>
  )
}
