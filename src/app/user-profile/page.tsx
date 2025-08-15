import { redirect } from "next/navigation"

export default function HomePage() {
  // Temporary redirect to a mock username; replace with actual current user
  redirect("/profile/alexchen")
}
