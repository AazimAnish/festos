'use client';

import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  Calendar,
  Download,
  Filter,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  HelpCircle,
  BarChart2,
  LineChart,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { toast } from 'sonner';
import { RegistrationTimelineChart } from './registration-timeline-chart';
import { RevenueChart } from './revenue-chart';
import { DemographicsChart } from './demographics-chart';
import { CheckInChart } from './check-in-chart';

interface InsightsDashboardProps {
  eventId: string;
}

// Mock data
const mockEventAnalytics = {
  registrations: 450,
  attendees: 382,
  checkInRate: 84.9,
  revenue: '4.5 ETH',
  averageTicketPrice: '0.01 ETH',
  ticketsSold: 450,
  growth: {
    registrations: 15.2,
    attendees: 12.8,
    revenue: 18.5,
  },
  demographics: {
    age: {
      '18-24': 15,
      '25-34': 45,
      '35-44': 25,
      '45-54': 10,
      '55+': 5,
    },
    gender: {
      Male: 55,
      Female: 38,
      'Non-binary': 5,
      'Prefer not to say': 2,
    },
    location: {
      Local: 65,
      National: 25,
      International: 10,
    },
  },
  timeData: {
    registrationTimes: {
      'Week of Event': 25,
      '1-2 Weeks Before': 35,
      '3-4 Weeks Before': 20,
      '1+ Month Before': 20,
    },
    checkInTimes: {
      '0-15 min before': 15,
      '15-30 min before': 25,
      '30-60 min before': 40,
      '1+ hour before': 20,
    },
  },
};

export function InsightsDashboard({ eventId }: InsightsDashboardProps) {
  // In a real app, we would use the eventId and timeframe for data fetching
  // For now, we'll use mock data
  const analytics = mockEventAnalytics;

  // Event-specific data that would be fetched using eventId
  const eventTitle = 'ETHIndia 2025'; // Would be fetched using eventId
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemographicTab, setSelectedDemographicTab] = useState<
    'age' | 'gender' | 'location'
  >('age');
  const [checkInChartType, setCheckInChartType] = useState<'line' | 'bar'>(
    'line'
  );

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    toast.success(
      `${format.toUpperCase()} export started. You'll receive it via email.`
    );
  };

  const handleFilter = (newTimeframe: string) => {
    setIsLoading(true);
    setTimeframe(newTimeframe);

    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Filtered to ${newTimeframe}`);
    }, 1000);
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6'>
        <div>
          <h2 className='font-primary text-xl font-bold text-foreground'>
            {eventTitle} Analytics
          </h2>
          <p className='font-secondary text-sm text-muted-foreground'>
            Comprehensive analytics to help you understand your event
            performance (Event ID: {eventId})
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                <Calendar className='w-4 h-4' />
                {timeframe}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleFilter('Last 7 Days')}>
                Last 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilter('Last 30 Days')}>
                Last 30 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilter('Last 90 Days')}>
                Last 90 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilter('This Year')}>
                This Year
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleFilter('Custom Range')}>
                Custom Range
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                <Filter className='w-4 h-4' />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleFilter('All Attendees')}>
                All Attendees
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilter('VIP Only')}>
                VIP Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilter('Checked-in Only')}>
                Checked-in Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilter('Not Checked-in')}>
                Not Checked-in
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                <Download className='w-4 h-4' />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-background border-border/50 rounded-xl'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='bg-primary/10 p-2 rounded-full'>
                <Users className='w-5 h-5 text-primary' />
              </div>
              <div className='flex items-center'>
                <span
                  className={`text-xs font-medium ${analytics.growth.registrations > 0 ? 'text-success' : 'text-destructive'}`}
                >
                  {analytics.growth.registrations > 0 ? '+' : ''}
                  {analytics.growth.registrations}%
                </span>
                {analytics.growth.registrations > 0 ? (
                  <ArrowUpRight className='w-3 h-3 text-success ml-1' />
                ) : (
                  <ArrowDownRight className='w-3 h-3 text-destructive ml-1' />
                )}
              </div>
            </div>
            <h3 className='font-primary text-2xl font-bold text-foreground'>
              {analytics.registrations}
            </h3>
            <p className='font-secondary text-sm text-muted-foreground'>
              Total Registrations
            </p>
          </CardContent>
        </Card>

        <Card className='bg-background border-border/50 rounded-xl'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='bg-success/10 p-2 rounded-full'>
                <Calendar className='w-5 h-5 text-success' />
              </div>
              <div className='flex items-center'>
                <span
                  className={`text-xs font-medium ${analytics.growth.attendees > 0 ? 'text-success' : 'text-destructive'}`}
                >
                  {analytics.growth.attendees > 0 ? '+' : ''}
                  {analytics.growth.attendees}%
                </span>
                {analytics.growth.attendees > 0 ? (
                  <ArrowUpRight className='w-3 h-3 text-success ml-1' />
                ) : (
                  <ArrowDownRight className='w-3 h-3 text-destructive ml-1' />
                )}
              </div>
            </div>
            <h3 className='font-primary text-2xl font-bold text-foreground'>
              {analytics.attendees}
            </h3>
            <p className='font-secondary text-sm text-muted-foreground'>
              Check-ins
            </p>
          </CardContent>
        </Card>

        <Card className='bg-background border-border/50 rounded-xl'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='bg-blue-500/10 p-2 rounded-full'>
                <BarChart3 className='w-5 h-5 text-blue-500' />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className='w-4 h-4 text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='w-48'>
                      Check-in rate is the percentage of registered attendees
                      who actually checked in
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <h3 className='font-primary text-2xl font-bold text-foreground'>
              {analytics.checkInRate}%
            </h3>
            <p className='font-secondary text-sm text-muted-foreground'>
              Check-in Rate
            </p>
          </CardContent>
        </Card>

        <Card className='bg-background border-border/50 rounded-xl'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='bg-warning/10 p-2 rounded-full'>
                <Wallet className='w-5 h-5 text-warning' />
              </div>
              <div className='flex items-center'>
                <span
                  className={`text-xs font-medium ${analytics.growth.revenue > 0 ? 'text-success' : 'text-destructive'}`}
                >
                  {analytics.growth.revenue > 0 ? '+' : ''}
                  {analytics.growth.revenue}%
                </span>
                {analytics.growth.revenue > 0 ? (
                  <ArrowUpRight className='w-3 h-3 text-success ml-1' />
                ) : (
                  <ArrowDownRight className='w-3 h-3 text-destructive ml-1' />
                )}
              </div>
            </div>
            <h3 className='font-primary text-2xl font-bold text-foreground'>
              {analytics.revenue}
            </h3>
            <p className='font-secondary text-sm text-muted-foreground'>
              Total Revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registration & Revenue Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-background border-border/50 rounded-xl'>
          <CardHeader className='pb-0'>
            <CardTitle className='text-lg font-primary font-bold'>
              Registration Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <RegistrationTimelineChart isLoading={isLoading} />

            <div className='mt-6 flex justify-between items-center'>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Peak Registration Date
                </p>
                <p className='font-semibold'>January 15, 2025</p>
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Most Popular Time
                </p>
                <p className='font-semibold'>7:00 PM - 9:00 PM</p>
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Registration Source
                </p>
                <p className='font-semibold'>Direct Link (63%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-background border-border/50 rounded-xl'>
          <CardHeader className='pb-0'>
            <CardTitle className='text-lg font-primary font-bold'>
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <RevenueChart isLoading={isLoading} />

            <div className='mt-6 grid grid-cols-3 gap-4'>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Avg. Ticket Price
                </p>
                <p className='font-semibold'>{analytics.averageTicketPrice}</p>
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Total Tickets Sold
                </p>
                <p className='font-semibold'>{analytics.ticketsSold}</p>
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Revenue per Attendee
                </p>
                <p className='font-semibold'>0.012 ETH</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendee Demographics */}
      <Card className='bg-background border-border/50 rounded-xl'>
        <CardHeader>
          <CardTitle className='text-lg font-primary font-bold'>
            Attendee Demographics
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <Tabs
            defaultValue='age'
            value={selectedDemographicTab}
            onValueChange={value =>
              setSelectedDemographicTab(value as 'age' | 'gender' | 'location')
            }
            className='w-full'
          >
            <TabsList className='mb-6'>
              <TabsTrigger value='age'>Age Distribution</TabsTrigger>
              <TabsTrigger value='gender'>Gender</TabsTrigger>
              <TabsTrigger value='location'>Location</TabsTrigger>
            </TabsList>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {/* Chart Area */}
              <div>
                <TabsContent value='age' className='m-0 p-0'>
                  <DemographicsChart
                    type='age'
                    data={{ age: analytics.demographics.age }}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value='gender' className='m-0 p-0'>
                  <DemographicsChart
                    type='gender'
                    data={{ gender: analytics.demographics.gender }}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value='location' className='m-0 p-0'>
                  <DemographicsChart
                    type='location'
                    data={{ location: analytics.demographics.location }}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </div>

              {/* Demographics Breakdown */}
              <div className='space-y-4'>
                <h4 className='font-primary text-base font-semibold'>
                  Demographics Breakdown
                </h4>
                <div className='space-y-4'>
                  {Object.entries(
                    selectedDemographicTab === 'age'
                      ? analytics.demographics.age
                      : selectedDemographicTab === 'gender'
                        ? analytics.demographics.gender
                        : analytics.demographics.location
                  ).map(([key, value]) => (
                    <div key={key} className='space-y-1'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-muted-foreground'>{key}</span>
                        <span className='font-medium'>{value}%</span>
                      </div>
                      <div className='h-2 w-full bg-muted/50 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-primary rounded-full'
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className='pt-4'>
                  <Button variant='outline' size='sm' className='gap-2'>
                    <Download className='w-4 h-4' />
                    Export Demographics
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Check-in Analytics */}
      <Card className='bg-background border-border/50 rounded-xl'>
        <CardHeader>
          <CardTitle className='text-lg font-primary font-bold'>
            Check-in Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='font-primary text-base font-semibold'>
                  Check-in Timeline
                </h4>
                <div className='flex items-center gap-2'>
                  <Button
                    variant={
                      checkInChartType === 'line' ? 'secondary' : 'outline'
                    }
                    size='sm'
                    className='h-8 w-8 p-0'
                    onClick={() => setCheckInChartType('line')}
                  >
                    <LineChart className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={
                      checkInChartType === 'bar' ? 'secondary' : 'outline'
                    }
                    size='sm'
                    className='h-8 w-8 p-0'
                    onClick={() => setCheckInChartType('bar')}
                  >
                    <BarChart2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <CheckInChart
                chartType={checkInChartType}
                isLoading={isLoading}
              />

              <div className='mt-6 grid grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>
                    Peak Check-in Time
                  </p>
                  <p className='font-semibold'>9:30 AM - 10:00 AM</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>
                    Earliest Check-in
                  </p>
                  <p className='font-semibold'>7:45 AM (2:15h before)</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className='font-primary text-base font-semibold mb-4'>
                Check-in Distribution
              </h4>

              <div className='space-y-4'>
                {Object.entries(analytics.timeData.checkInTimes).map(
                  ([key, value]) => (
                    <div key={key} className='space-y-1'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-muted-foreground'>{key}</span>
                        <span className='font-medium'>{value}%</span>
                      </div>
                      <div className='h-2 w-full bg-muted/50 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-success rounded-full'
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className='mt-8'>
                <h4 className='font-primary text-base font-semibold mb-3'>
                  Check-in Sources
                </h4>
                <div className='flex items-center gap-4'>
                  <div className='flex flex-col items-center'>
                    <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2'>
                      <QrCode className='w-7 h-7 text-primary' />
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      QR Code
                    </span>
                    <span className='font-medium'>76%</span>
                  </div>

                  <div className='flex flex-col items-center'>
                    <div className='w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-2'>
                      <Users className='w-7 h-7 text-muted-foreground' />
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      Manual
                    </span>
                    <span className='font-medium'>24%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QrCode(props: React.ComponentProps<typeof Users>) {
  return <Users {...props} />;
}
