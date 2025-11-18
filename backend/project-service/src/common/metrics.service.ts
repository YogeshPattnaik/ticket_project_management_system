import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private taskCreatedCounter = new Counter({
    name: 'tasks_created_total',
    help: 'Total number of tasks created',
    labelNames: ['project', 'priority'],
  });

  private taskUpdatedCounter = new Counter({
    name: 'tasks_updated_total',
    help: 'Total number of tasks updated',
    labelNames: ['project'],
  });

  private apiResponseTime = new Histogram({
    name: 'api_response_time_seconds',
    help: 'API response time in seconds',
    labelNames: ['method', 'route', 'status_code'],
  });

  trackTaskCreation(project: string, priority: number): void {
    this.taskCreatedCounter.inc({ project, priority: priority.toString() });
  }

  trackTaskUpdate(project: string): void {
    this.taskUpdatedCounter.inc({ project });
  }

  trackApiResponse(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ): void {
    this.apiResponseTime.observe(
      { method, route, status_code: statusCode.toString() },
      duration / 1000
    );
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}

