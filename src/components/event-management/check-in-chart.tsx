"use client";

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CheckInData {
  time: string;
  count: number;
}

interface CheckInChartProps {
  data?: CheckInData[];
  isLoading?: boolean;
  chartType?: 'line' | 'bar';
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
    tension?: number;
    fill?: boolean;
    pointRadius?: number;
    pointBackgroundColor?: string;
    barPercentage?: number;
    categoryPercentage?: number;
  }[];
}

interface TooltipContext {
  raw: unknown;
  label: string;
}

export function CheckInChart({ 
  data, 
  isLoading = false,
  chartType = 'line'
}: CheckInChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Generate mock data if none is provided
  useEffect(() => {
    if (isLoading) return;

    const generateMockData = () => {
      // If data is provided, use it. Otherwise, generate mock data
      if (data && data.length > 0) {
        return {
          labels: data.map(item => item.time),
          datasets: [
            {
              label: 'Check-ins',
              data: data.map(item => item.count),
              borderColor: 'rgba(16, 185, 129, 1)', // Success color
              backgroundColor: chartType === 'line' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.7)',
              borderWidth: 2,
              tension: 0.3,
              fill: chartType === 'line',
              pointRadius: chartType === 'line' ? 3 : 0,
              pointBackgroundColor: 'rgba(16, 185, 129, 1)',
              barPercentage: 0.7,
              categoryPercentage: 0.8,
            }
          ]
        };
      }

      // Generate mock check-in data for an event day
      const mockLabels = [];
      const mockData = [];
      const eventStart = 9; // 9 AM
      const eventEnd = 17; // 5 PM

      // Add time slots before event start
      mockLabels.push('8:00 AM');
      mockData.push(3);
      mockLabels.push('8:30 AM');
      mockData.push(12);
      
      // Generate hourly check-in data
      for (let hour = eventStart; hour <= eventEnd; hour++) {
        // Morning peak at 9-10 AM, afternoon lull, then smaller peak at 2-3 PM
        let count;
        if (hour === 9) {
          count = 85; // Peak check-in
        } else if (hour === 10) {
          count = 45;
        } else if (hour >= 12 && hour <= 13) {
          count = 15; // Lunch lull
        } else if (hour === 14) {
          count = 35; // Afternoon mini-peak
        } else {
          count = Math.floor(Math.random() * 20) + 10; // Random between 10-30
        }
        
        mockLabels.push(`${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`);
        mockData.push(count);

        if (hour < eventEnd) {
          mockLabels.push(`${hour % 12 || 12}:30 ${hour >= 12 ? 'PM' : 'AM'}`);
          mockData.push(Math.floor(count * 0.7)); // Half-hour usually has fewer check-ins
        }
      }

      return {
        labels: mockLabels,
        datasets: [
          {
            label: 'Check-ins',
            data: mockData,
            borderColor: 'rgba(16, 185, 129, 1)', // Success color
            backgroundColor: chartType === 'line' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.7)',
            borderWidth: 2,
            tension: 0.3,
            fill: chartType === 'line',
            pointRadius: chartType === 'line' ? 3 : 0,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            barPercentage: 0.7,
            categoryPercentage: 0.8,
          }
        ]
      };
    };

    setChartData(generateMockData());
  }, [data, isLoading, chartType]);

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
            return `Check-ins: ${context.raw as number}`;
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
          text: 'Number of Check-ins',
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
          autoSkip: true,
          maxTicksLimit: 15,
          font: {
            size: 10,
          },
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

  // Render the appropriate chart type
  return (
    <div className="h-64">
      {chartType === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
}