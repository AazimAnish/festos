'use client';

import { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface RevenueData {
  ticketTypes: {
    labels: string[];
    values: number[];
  };
  timeDistribution: {
    labels: string[];
    values: number[];
  };
  totalRevenue: string;
  currency?: string;
}

interface RevenueChartProps {
  data?: RevenueData;
  isLoading?: boolean;
}

// Import Chart.js types for proper typing
import type { TooltipItem } from 'chart.js';

export function RevenueChart({ data, isLoading = false }: RevenueChartProps) {
  const [chartView, setChartView] = useState<'distribution' | 'timeline'>(
    'distribution'
  );

  // Generate mock data if none is provided
  const chartData = data || {
    ticketTypes: {
      labels: ['General Admission', 'VIP', 'Early Bird', 'Group Discount'],
      values: [50, 30, 15, 5],
    },
    timeDistribution: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Last Week'],
      values: [10, 15, 25, 35, 15],
    },
    totalRevenue: '4.5 ETH',
    currency: 'ETH',
  };

  // Pie chart data
  const distributionData = {
    labels: chartData.ticketTypes.labels,
    datasets: [
      {
        data: chartData.ticketTypes.values,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)', // Primary
          'rgba(16, 185, 129, 0.8)', // Success
          'rgba(245, 158, 11, 0.8)', // Warning
          'rgba(124, 58, 237, 0.8)', // Purple
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(124, 58, 237, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data for timeline
  const timelineData = {
    labels: chartData.timeDistribution.labels,
    datasets: [
      {
        label: `Revenue (${chartData.currency || 'ETH'})`,
        data: chartData.timeDistribution.values,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          padding: 20,
          boxWidth: 12,
          color: 'rgba(156, 163, 175, 0.8)',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'doughnut'>) {
            const label = context.label || '';
            const value = (context.raw as number) || 0;
            const total = (
              context.chart.data.datasets[0].data as number[]
            ).reduce((a: number, b: number) => a + b, 0);
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${percentage}% (${value}%)`;
          },
        },
      },
    },
    cutout: '65%',
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            return `Revenue: ${context.raw as number} ${chartData.currency || 'ETH'}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(156, 163, 175, 0.8)',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(156, 163, 175, 0.8)',
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className='h-64 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <Tabs
        value={chartView}
        onValueChange={v => setChartView(v as 'distribution' | 'timeline')}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2 mb-6 rounded-lg'>
          <TabsTrigger
            className='rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            value='distribution'
          >
            Ticket Types
          </TabsTrigger>
          <TabsTrigger
            className='rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            value='timeline'
          >
            Revenue Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value='distribution' className='space-y-4'>
          <div className='h-64'>
            <Doughnut data={distributionData} options={pieOptions} />
          </div>
        </TabsContent>

        <TabsContent value='timeline' className='space-y-4'>
          <div className='h-64'>
            <Bar data={timelineData} options={barOptions} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
