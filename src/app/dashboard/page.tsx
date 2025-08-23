import { FadeIn } from '@/shared/components/ui/fade-in';
import { UserDashboard } from '@/features/dashboard/user-dashboard';

export default function DashboardPage() {
  return (
    <div className='min-h-screen bg-background'>
      <FadeIn variant='up' timing='normal'>
        <UserDashboard />
      </FadeIn>
    </div>
  );
}
