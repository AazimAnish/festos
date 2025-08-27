/**
 * Health Monitor - Monitoring Layer
 * 
 * Monitors the health and performance of all three storage layers
 * and provides analytics and alerting capabilities.
 */

import { 
  HealthStatus, 
  DataConsistencyCheck,
  SyncStatus
} from '../core/interfaces';
import { DatabaseService } from '../storage/database-service';
import { BlockchainService } from '../storage/blockchain-service';
import { IPFSService } from '../storage/ipfs-service';
import { EventOrchestrator } from '../integration/event-orchestrator';

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  database: HealthStatus;
  blockchain: HealthStatus;
  ipfs: HealthStatus;
  lastChecked: Date;
  responseTime: number;
  details: {
    totalEvents: number;
    syncedEvents: number;
    pendingSync: number;
    errors: string[];
  };
}

export interface PerformanceMetrics {
  database: {
    avgResponseTime: number;
    totalQueries: number;
    errorRate: number;
  };
  blockchain: {
    avgResponseTime: number;
    totalTransactions: number;
    errorRate: number;
  };
  ipfs: {
    avgResponseTime: number;
    totalUploads: number;
    errorRate: number;
  };
  overall: {
    avgResponseTime: number;
    totalOperations: number;
    errorRate: number;
  };
}

export interface AlertConfig {
  enabled: boolean;
  responseTimeThreshold: number; // milliseconds
  errorRateThreshold: number; // percentage
  consistencyCheckInterval: number; // minutes
  notificationChannels: string[];
}

export class HealthMonitor {
  private databaseService: DatabaseService;
  private blockchainService: BlockchainService;
  private ipfsService: IPFSService;
  private orchestrator: EventOrchestrator;
  
  private metrics: PerformanceMetrics;
  private alertConfig: AlertConfig;
  private lastConsistencyCheck: Date | null = null;

  constructor(alertConfig?: Partial<AlertConfig>) {
    this.databaseService = new DatabaseService();
    this.blockchainService = new BlockchainService();
    this.ipfsService = new IPFSService();
    this.orchestrator = new EventOrchestrator();
    
    this.metrics = this.initializeMetrics();
    this.alertConfig = {
      enabled: true,
      responseTimeThreshold: 5000, // 5 seconds
      errorRateThreshold: 5, // 5%
      consistencyCheckInterval: 60, // 60 minutes
      notificationChannels: ['console'],
      ...alertConfig
    };
  }

  /**
   * Get comprehensive system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const startTime = Date.now();
    
    try {
      // Check all storage providers
      const [dbHealth, bcHealth, ipfsHealth] = await Promise.all([
        this.databaseService.healthCheck(),
        this.blockchainService.healthCheck(),
        this.ipfsService.healthCheck()
      ]);

      // Get system statistics
      const stats = await this.getSystemStatistics();
      
      // Determine overall health
      const healthStatuses = [dbHealth.status, bcHealth.status, ipfsHealth.status];
      const overall = this.calculateOverallHealth(healthStatuses);
      
      const responseTime = Date.now() - startTime;

      return {
        overall,
        database: dbHealth,
        blockchain: bcHealth,
        ipfs: ipfsHealth,
        lastChecked: new Date(),
        responseTime,
        details: stats
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        overall: 'unhealthy',
        database: this.createErrorHealthStatus('Database health check failed'),
        blockchain: this.createErrorHealthStatus('Blockchain health check failed'),
        ipfs: this.createErrorHealthStatus('IPFS health check failed'),
        lastChecked: new Date(),
        responseTime,
        details: {
          totalEvents: 0,
          syncedEvents: 0,
          pendingSync: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        }
      };
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Update performance metrics
   */
  updateMetrics(
    provider: 'database' | 'blockchain' | 'ipfs',
    responseTime: number,
    success: boolean
  ): void {
    const providerMetrics = this.metrics[provider];
    
    // Get the appropriate count property based on provider
    const countProperty = provider === 'database' ? 'totalQueries' : 
                         provider === 'blockchain' ? 'totalTransactions' : 'totalUploads';
    const currentCount = providerMetrics[countProperty as keyof typeof providerMetrics] as number;
    
    // Update response time (simple moving average)
    providerMetrics.avgResponseTime = 
      (providerMetrics.avgResponseTime * currentCount + responseTime) / 
      (currentCount + 1);
    
    // Update counts using type assertion for dynamic property access
    (providerMetrics as Record<string, number>)[countProperty] = currentCount + 1;
    if (!success) {
      providerMetrics.errorRate = 
        ((providerMetrics.errorRate * currentCount) + 1) / 
        (currentCount + 1);
    }

    // Update overall metrics
    this.updateOverallMetrics();
    
    // Check for alerts
    this.checkAlerts(provider, responseTime, success);
  }

  /**
   * Run data consistency check
   */
  async runConsistencyCheck(): Promise<{
    totalEvents: number;
    consistentEvents: number;
    inconsistentEvents: number;
    details: DataConsistencyCheck[];
  }> {
    const startTime = Date.now();
    
    try {
      // Get all events that need checking
      const events = await this.orchestrator.getEvents({ limit: 1000 });
      
      const consistencyChecks: DataConsistencyCheck[] = [];
      let consistentEvents = 0;
      let inconsistentEvents = 0;

      for (const event of events.events) {
        const check = await this.orchestrator.checkDataConsistency(event.id);
        consistencyChecks.push(check);
        
        if (check.discrepancies.length === 0) {
          consistentEvents++;
        } else {
          inconsistentEvents++;
        }
      }

      this.lastConsistencyCheck = new Date();
      
      // Update metrics
      this.updateMetrics('database', Date.now() - startTime, true);

      return {
        totalEvents: events.events.length,
        consistentEvents,
        inconsistentEvents,
        details: consistencyChecks
      };
    } catch {
      this.updateMetrics('database', Date.now() - startTime, false);
      
      return {
        totalEvents: 0,
        consistentEvents: 0,
        inconsistentEvents: 0,
        details: []
      };
    }
  }

  /**
   * Run data synchronization
   */
  async runDataSync(): Promise<SyncStatus> {
    const startTime = Date.now();
    
    try {
      const syncStatus = await this.orchestrator.syncDataConsistency();
      
      // Update metrics
      this.updateMetrics('database', Date.now() - startTime, syncStatus.failedEvents === 0);
      
      return syncStatus;
    } catch {
      this.updateMetrics('database', Date.now() - startTime, false);
      
      return {
        totalEvents: 0,
        syncedEvents: 0,
        failedEvents: 1,
        lastSyncTime: new Date(),
        errors: ['Unknown error']
      };
    }
  }

  /**
   * Get storage provider configurations
   */
  getStorageConfigs(): Record<string, Record<string, unknown>> {
    return {
      database: this.databaseService.getConfig(),
      blockchain: this.blockchainService.getConfig(),
      ipfs: this.ipfsService.getConfig()
    };
  }

  /**
   * Set alert configuration
   */
  setAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }

  /**
   * Get alert configuration
   */
  getAlertConfig(): AlertConfig {
    return { ...this.alertConfig };
  }

  /**
   * Check if consistency check is due
   */
  isConsistencyCheckDue(): boolean {
    if (!this.lastConsistencyCheck) {
      return true;
    }
    
    const minutesSinceLastCheck = 
      (Date.now() - this.lastConsistencyCheck.getTime()) / (1000 * 60);
    
    return minutesSinceLastCheck >= this.alertConfig.consistencyCheckInterval;
  }

  /**
   * Get system statistics
   */
  private async getSystemStatistics(): Promise<{
    totalEvents: number;
    syncedEvents: number;
    pendingSync: number;
    errors: string[];
  }> {
    try {
      const events = await this.orchestrator.getEvents({ limit: 1000 });
      const syncStatus = await this.orchestrator.syncDataConsistency();
      
      return {
        totalEvents: events.total,
        syncedEvents: syncStatus.syncedEvents,
        pendingSync: syncStatus.totalEvents - syncStatus.syncedEvents,
        errors: syncStatus.errors
      };
    } catch (error) {
      return {
        totalEvents: 0,
        syncedEvents: 0,
        pendingSync: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Calculate overall health status
   */
  private calculateOverallHealth(statuses: Array<'healthy' | 'degraded' | 'unhealthy'>): 'healthy' | 'degraded' | 'unhealthy' {
    if (statuses.every(status => status === 'healthy')) {
      return 'healthy';
    }
    
    if (statuses.some(status => status === 'unhealthy')) {
      return 'unhealthy';
    }
    
    return 'degraded';
  }

  /**
   * Create error health status
   */
  private createErrorHealthStatus(error: string): HealthStatus {
    return {
      status: 'unhealthy',
      responseTime: 0,
      lastChecked: new Date(),
      error
    };
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      database: {
        avgResponseTime: 0,
        totalQueries: 0,
        errorRate: 0
      },
      blockchain: {
        avgResponseTime: 0,
        totalTransactions: 0,
        errorRate: 0
      },
      ipfs: {
        avgResponseTime: 0,
        totalUploads: 0,
        errorRate: 0
      },
      overall: {
        avgResponseTime: 0,
        totalOperations: 0,
        errorRate: 0
      }
    };
  }

  /**
   * Update overall metrics
   */
  private updateOverallMetrics(): void {
    const providers = ['database', 'blockchain', 'ipfs'] as const;
    
    let totalResponseTime = 0;
    let totalOperations = 0;
    let totalErrors = 0;
    
    for (const provider of providers) {
      const metrics = this.metrics[provider];
      const countProperty = provider === 'database' ? 'totalQueries' : 
                           provider === 'blockchain' ? 'totalTransactions' : 'totalUploads';
      const count = metrics[countProperty as keyof typeof metrics] as number;
      
      totalResponseTime += metrics.avgResponseTime * count;
      totalOperations += count;
      totalErrors += metrics.errorRate * count;
    }
    
    this.metrics.overall.avgResponseTime = totalOperations > 0 ? totalResponseTime / totalOperations : 0;
    this.metrics.overall.totalOperations = totalOperations;
    this.metrics.overall.errorRate = totalOperations > 0 ? totalErrors / totalOperations : 0;
  }

  /**
   * Check for alerts
   */
  private checkAlerts(
    provider: 'database' | 'blockchain' | 'ipfs',
    responseTime: number,
    _success: boolean
  ): void {
    if (!this.alertConfig.enabled) {
      return;
    }

    const alerts: string[] = [];

    // Check response time threshold
    if (responseTime > this.alertConfig.responseTimeThreshold) {
      alerts.push(`${provider} response time (${responseTime}ms) exceeded threshold (${this.alertConfig.responseTimeThreshold}ms)`);
    }

    // Check error rate threshold
    const currentErrorRate = this.metrics[provider].errorRate * 100;
    if (currentErrorRate > this.alertConfig.errorRateThreshold) {
      alerts.push(`${provider} error rate (${currentErrorRate.toFixed(2)}%) exceeded threshold (${this.alertConfig.errorRateThreshold}%)`);
    }

    // Send alerts
    if (alerts.length > 0) {
      this.sendAlerts(alerts);
    }
  }

  /**
   * Send alerts through configured channels
   */
  private sendAlerts(_alerts: string[]): void {
    for (const channel of this.alertConfig.notificationChannels) {
      switch (channel) {
        case 'console':
          // Health Monitor Alerts
          break;
        case 'email':
          // TODO: Implement email notifications
          break;
        case 'slack':
          // TODO: Implement Slack notifications
          break;
        default:
          // Unknown notification channel
      }
    }
  }
}
