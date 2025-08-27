/**
 * Health Check API - Three-Layer Storage Architecture
 * 
 * GET /api/health
 * Provides comprehensive health status for all storage layers
 */

import { NextRequest, NextResponse } from 'next/server';
import { HealthMonitor } from '@/lib/services/monitoring/health-monitor';

// Initialize health monitor
const healthMonitor = new HealthMonitor();

/**
 * GET /api/health
 * Get comprehensive system health status
 */
export async function GET(_request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get system health
    const systemHealth = await healthMonitor.getSystemHealth();
    
    // Get performance metrics
    const performanceMetrics = healthMonitor.getPerformanceMetrics();
    
    // Get storage configurations
    const storageConfigs = healthMonitor.getStorageConfigs();
    
    // Get alert configuration
    const alertConfig = healthMonitor.getAlertConfig();
    
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        system: {
          overall: systemHealth.overall,
          lastChecked: systemHealth.lastChecked,
          responseTime: systemHealth.responseTime,
          details: systemHealth.details
        },
        providers: {
          database: {
            status: systemHealth.database.status,
            responseTime: systemHealth.database.responseTime,
            lastChecked: systemHealth.database.lastChecked,
            details: systemHealth.database.details
          },
          blockchain: {
            status: systemHealth.blockchain.status,
            responseTime: systemHealth.blockchain.responseTime,
            lastChecked: systemHealth.blockchain.lastChecked,
            details: systemHealth.blockchain.details
          },
          ipfs: {
            status: systemHealth.ipfs.status,
            responseTime: systemHealth.ipfs.responseTime,
            lastChecked: systemHealth.ipfs.lastChecked,
            details: systemHealth.ipfs.details
          }
        },
        performance: performanceMetrics,
        configuration: {
          storage: storageConfigs,
          alerts: alertConfig
        }
      },
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // GET /api/health error

    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    }, { status: 503 });
  }
}

/**
 * POST /api/health/consistency
 * Run data consistency check
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'consistency':
        const consistencyResult = await healthMonitor.runConsistencyCheck();
        
        const responseTime = Date.now() - startTime;
        
        return NextResponse.json({
          success: true,
          data: consistencyResult,
          metadata: {
            responseTime,
            timestamp: new Date().toISOString(),
            version: '2.0',
            action: 'consistency_check'
          }
        });

      case 'sync':
        const syncResult = await healthMonitor.runDataSync();
        
        const syncResponseTime = Date.now() - startTime;
        
        return NextResponse.json({
          success: true,
          data: syncResult,
          metadata: {
            responseTime: syncResponseTime,
            timestamp: new Date().toISOString(),
            version: '2.0',
            action: 'data_sync'
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use ?action=consistency or ?action=sync' },
          { status: 400 }
        );
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // POST /api/health error

    return NextResponse.json({
      success: false,
      error: 'Health action failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    }, { status: 500 });
  }
}
