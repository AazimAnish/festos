"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
);

export interface DemographicsData {
  age?: Record<string, number>;
  gender?: Record<string, number>;
  location?: Record<string, number>;
}

interface DemographicsChartProps {
  data?: DemographicsData;
  type: 'age' | 'gender' | 'location';
  isLoading?: boolean;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

interface TooltipContext {
  raw: unknown;
  label: string;
}

export function DemographicsChart({ data, type, isLoading = false }: DemographicsChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Default color schemes
  const colors = useMemo(() => ({
    backgroundColor: [
      'rgba(99, 102, 241, 0.8)',  // Primary (Indigo)
      'rgba(16, 185, 129, 0.8)',  // Success (Green)
      'rgba(245, 158, 11, 0.8)',  // Warning (Amber)
      'rgba(239, 68, 68, 0.8)',   // Destructive (Red)
      'rgba(124, 58, 237, 0.8)',  // Purple
      'rgba(14, 165, 233, 0.8)',  // Blue
    ],
    borderColor: [
      'rgba(99, 102, 241, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(124, 58, 237, 1)',
      'rgba(14, 165, 233, 1)',
    ],
  }), []);

  // Default mock data by type
  const defaultData = useMemo(() => ({
    age: {
      '18-24': 15,
      '25-34': 45,
      '35-44': 25,
      '45-54': 10,
      '55+': 5,
    },
    gender: {
      'Male': 55,
      'Female': 38,
      'Non-binary': 5,
      'Prefer not to say': 2,
    },
    location: {
      'Local': 65,
      'National': 25,
      'International': 10,
    },
  }), []);

  // Generate chart data
  useEffect(() => {
    if (isLoading) return;

    // Use provided data or default mock data
    const sourceData = data?.[type] || defaultData[type];
    
    // Process data for chart
    const chartLabels = Object.keys(sourceData);
    const chartValues = Object.values(sourceData);

    // Create data object for pie chart
    const newChartData = {
      labels: chartLabels,
      datasets: [
        {
          data: chartValues,
          backgroundColor: colors.backgroundColor.slice(0, chartLabels.length),
          borderColor: colors.borderColor.slice(0, chartLabels.length),
          borderWidth: 1,
        },
      ],
    };

    setChartData(newChartData);
  }, [data, type, isLoading, colors.backgroundColor, colors.borderColor, defaultData]);

  // Chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          padding: 15,
          boxWidth: 12,
          color: 'rgba(156, 163, 175, 0.8)',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipContext) {
            const label = context.label || '';
            const value = context.raw as number || 0;
            return `${label}: ${value}%`;
          }
        }
      },
    },
  };

  // Bar chart options - alternative visualization
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipContext) {
            return `${context.raw as number}%`;
          }
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: unknown) {
            return `${value as number}%`;
          },
          color: 'rgba(156, 163, 175, 0.8)',
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: 'rgba(156, 163, 175, 0.8)',
        },
        grid: {
          display: false,
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

  // Use Pie chart for gender and location, horizontal Bar chart for age
  return (
    <div className="h-64">
      {type === 'age' ? (
        <Bar data={chartData} options={barOptions} />
      ) : (
        <Pie data={chartData} options={pieOptions} />
      )}
    </div>
  );
}
