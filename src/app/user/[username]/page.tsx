import { ProfileDashboard } from '@/components/profile/profile-dashboard';

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { username } = await params;

  // In a real app, this would:
  // 1. Check if the current user is viewing their own profile
  // 2. Fetch user data based on username
  // 3. Handle authentication and permissions

  // For now, we'll pass the username and let the client component determine if it's personal
  // The client component will compare with the connected wallet's username
  return <ProfileDashboard username={username} />;
}
