import { UserProfile } from "@/components/user-profile/user-profile"

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  await params // Await to satisfy the Promise requirement
  return <UserProfile />
}


