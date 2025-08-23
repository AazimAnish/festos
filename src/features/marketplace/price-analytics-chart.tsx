'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChevronDown } from 'lucide-react';

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

// Types
interface PriceDataPoint {
  date: string;
  avgPrice: number;
  volume: number;
}

interface PriceAnalyticsChartProps {
  timeFrame?: '7d' | '30d' | '90d' | 'all';
  title?: string;
  showControls?: boolean;
}

export function PriceAnalyticsChart({
  timeFrame = '30d',
  title = 'Price Analytics',
  showControls = true,
}: PriceAnalyticsChartProps) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<
    '7d' | '30d' | '90d' | 'all'
  >(timeFrame);
  const [showTimeFrameDropdown, setShowTimeFrameDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock data based on the selected time frame
  const data = useMemo(() => {
    const numberOfDays =
      selectedTimeFrame === '7d'
        ? 7
        : selectedTimeFrame === '30d'
          ? 30
          : selectedTimeFrame === '90d'
            ? 90
            : 180;

    // Start date based on the number of days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numberOfDays);

    // Generate mock price data
    const priceData: PriceDataPoint[] = [];

    // Base price and some volatility
    let basePrice = 0.15; // ETH

    // For each day
    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Add some random variation to price
      const dailyVariation = (Math.random() - 0.5) * 0.01; // ±0.005 ETH
      const trendFactor = Math.sin(i / (numberOfDays / 3)) * 0.02; // Sinusoidal trend

      // Calculate price with trend and random variation
      const price = Math.max(0.05, basePrice + trendFactor + dailyVariation);

      // Volume varies between 1-5 tickets per day
      const volume = Math.floor(Math.random() * 5) + 1;

      priceData.push({
        date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
        avgPrice: parseFloat(price.toFixed(3)),
        volume,
      });

      // Slightly adjust base price for next day (small trend)
      basePrice = price;
    }

    return priceData;
  }, [selectedTimeFrame]);

  // Simulate loading data
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedTimeFrame]);

  // Prepare chart data
  const chartData = {
    labels: data.map(point => {
      // For shorter timeframes, show more detailed date labels
      if (selectedTimeFrame === '7d') {
        return new Date(point.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
      }
      // For longer timeframes, show simpler labels
      if (selectedTimeFrame === '30d') {
        const date = new Date(point.date);
        return date.getDate() % 5 === 0
          ? new Date(point.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })
          : '';
      }

      // For 90d or all, show monthly labels
      const date = new Date(point.date);
      return date.getDate() === 1
        ? new Date(point.date).toLocaleDateString(undefined, { month: 'short' })
        : '';
    }),
    datasets: [
      {
        label: 'Average Price (ETH)',
        data: data.map(point => point.avgPrice),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.2,
        pointRadius: selectedTimeFrame === '7d' ? 3 : 0,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  };

  // Chart options
  const chartOptions = {
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
          label: function (context: { raw: unknown }) {
            return `Price: ${context.raw as number} ETH`;
          },
          title: function (tooltipItems: Array<{ label: string }>) {
            return tooltipItems[0].label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value: unknown) {
            return `${value as number} ETH`;
          },
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
          maxRotation: 0,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!data.length)
      return {
        avgPrice: 0,
        totalVolume: 0,
        priceChange: 0,
        priceChangePercent: 0,
      };

    const avgPrice =
      data.reduce((sum, item) => sum + item.avgPrice, 0) / data.length;
    const totalVolume = data.reduce((sum, item) => sum + item.volume, 0);

    // Calculate price change from first to last day
    const firstPrice = data[0]?.avgPrice || 0;
    const lastPrice = data[data.length - 1]?.avgPrice || 0;
    const priceChange = lastPrice - firstPrice;
    const priceChangePercent =
      firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

    return {
      avgPrice: parseFloat(avgPrice.toFixed(3)),
      totalVolume,
      priceChange: parseFloat(priceChange.toFixed(3)),
      priceChangePercent: parseFloat(priceChangePercent.toFixed(1)),
    };
  }, [data]);

  const timeFrameLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    all: 'All Time',
  };

  return (
    <div className='space-y-6'>
      {/* Header with title and controls */}
      {showControls && (
        <div className='flex justify-between items-center'>
          <h3 className='font-primary text-lg font-medium'>{title}</h3>

          <div className='relative'>
            <Button
              variant='outline'
              size='sm'
              className='gap-2'
              onClick={() => setShowTimeFrameDropdown(!showTimeFrameDropdown)}
            >
              {timeFrameLabels[selectedTimeFrame]}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showTimeFrameDropdown ? 'rotate-180' : ''}`}
              />
            </Button>

            {showTimeFrameDropdown && (
              <div className='absolute right-0 mt-1 z-10 bg-background border border-border rounded-lg shadow-lg'>
                {(
                  Object.keys(timeFrameLabels) as Array<
                    keyof typeof timeFrameLabels
                  >
                ).map(key => (
                  <button
                    key={key}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-muted/50 ${selectedTimeFrame === key ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => {
                      setSelectedTimeFrame(key);
                      setShowTimeFrameDropdown(false);
                    }}
                  >
                    {timeFrameLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className='h-64'>
        {isLoading ? (
          <div className='h-full flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>

      {/* Stats summary */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-6'>
        <div className='space-y-1'>
          <span className='text-sm text-muted-foreground'>Avg. Price</span>
          <div className='font-primary text-lg font-bold'>
            {stats.avgPrice} ETH
          </div>
        </div>
        <div className='space-y-1'>
          <span className='text-sm text-muted-foreground'>Total Volume</span>
          <div className='font-primary text-lg font-bold'>
            {stats.totalVolume} tickets
          </div>
        </div>
        <div className='space-y-1'>
          <span className='text-sm text-muted-foreground'>Price Change</span>
          <div
            className={`font-primary text-lg font-bold ${stats.priceChange >= 0 ? 'text-success' : 'text-destructive'}`}
          >
            {stats.priceChange >= 0 ? '+' : ''}
            {stats.priceChange} ETH
          </div>
        </div>
        <div className='space-y-1'>
          <span className='text-sm text-muted-foreground'>Change %</span>
          <div
            className={`font-primary text-lg font-bold ${stats.priceChangePercent >= 0 ? 'text-success' : 'text-destructive'}`}
          >
            {stats.priceChangePercent >= 0 ? '+' : ''}
            {stats.priceChangePercent}%
          </div>
        </div>
      </div>
    </div>
  );
}
