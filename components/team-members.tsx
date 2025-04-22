import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getTeamMembers } from "@/app/actions/get-team-members"

export default async function TeamMembers() {
  const members = await getTeamMembers()

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>People with access to this project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.length === 0 ? (
            <p className="text-muted-foreground">No team members yet. Invite someone to get started!</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Avatar>
                    {member.avatar_url ? (
                      <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
