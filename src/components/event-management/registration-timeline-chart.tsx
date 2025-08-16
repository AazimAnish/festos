"use client";

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RegistrationData {
  date: string;
  count: number;
}

interface RegistrationTimelineChartProps {
  data?: RegistrationData[];
  isLoading?: boolean;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
    tension: number;
    fill: boolean;
    pointRadius: number;
    pointBackgroundColor: string;
  }[];
}

interface TooltipContext {
  raw: unknown;
  label: string;
}

export function RegistrationTimelineChart({ data, isLoading = false }: RegistrationTimelineChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Generate mock data if none is provided
  useEffect(() => {
    if (isLoading) return;

    const generateMockData = () => {
      // If data is provided, use it. Otherwise, generate mock data
      if (data && data.length > 0) {
        return {
          labels: data.map(item => new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
          datasets: [
            {
              label: 'Registrations',
              data: data.map(item => item.count),
              borderColor: 'rgba(99, 102, 241, 1)', // Primary color
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointRadius: 3,
              pointBackgroundColor: 'rgba(99, 102, 241, 1)',
            }
          ]
        };
      }

      // Generate mock data for 30 days
      const mockData = [];
      const today = new Date();
      const labels = [];

      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

        // Generate some plausible registration data with a peak in the middle
        let count;
        if (i > 20) {
          // Early days - fewer registrations
          count = Math.floor(Math.random() * 10) + 1;
        } else if (i > 10) {
          // Middle - peak registrations
          count = Math.floor(Math.random() * 20) + 10;
        } else {
          // Later days - moderate registrations
          count = Math.floor(Math.random() * 15) + 5;
        }

        mockData.push(count);
      }

      return {
        labels,
        datasets: [
          {
            label: 'Registrations',
            data: mockData,
            borderColor: 'rgba(99, 102, 241, 1)', // Primary color
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          }
        ]
      };
    };

    setChartData(generateMockData());
  }, [data, isLoading]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: TooltipContext) {
            return `Registrations: ${context.raw as number}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: 'rgba(156, 163, 175, 0.8)',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.1)',
        },
        title: {
          display: true,
          text: 'Number of Registrations',
          color: 'rgba(156, 163, 175, 0.8)',
          font: {
            size: 12,
          },
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          color: 'rgba(156, 163, 175, 0.8)',
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}