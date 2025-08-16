import { FadeIn } from "@/components/ui/fade-in"
import { UserDashboard } from "@/components/dashboard/user-dashboard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <FadeIn variant="up" timing="normal">
        <UserDashboard />
      </FadeIn>
    </div>
  )
}