import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SLA, Priority, Duration, EscalationRule } from '@task-management/interfaces';
import { Logger } from '@task-management/utils';

@Injectable()
export class SlasService {
  private readonly logger = new Logger('SlasService');

  constructor(private prisma: PrismaService) {}

  async create(sla: Omit<SLA, 'id'>): Promise<SLA> {
    const created = await this.prisma.sLA.create({
      data: {
        name: sla.name,
        priority: sla.priority,
        responseTime: sla.responseTime as any,
        resolutionTime: sla.resolutionTime as any,
        escalationRules: sla.escalationRules as any,
        projectId: sla.projectId,
      },
    });

    this.logger.info(`SLA created: ${created.name}`);

    return this.mapSlaToDto(created);
  }

  async findAll(projectId?: string): Promise<SLA[]> {
    const slas = await this.prisma.sLA.findMany({
      where: projectId ? { projectId } : undefined,
    });

    return slas.map((sla: any) => this.mapSlaToDto(sla));
  }

  async findOne(id: string): Promise<SLA> {
    const sla = await this.prisma.sLA.findUnique({
      where: { id },
    });

    if (!sla) {
      throw new NotFoundException('SLA', id);
    }

    return this.mapSlaToDto(sla);
  }

  calculateBreachTime(
    createdAt: Date,
    sla: SLA,
    _workingHours: { start: number; end: number } = { start: 9, end: 17 }
  ): Date {
    const resolutionTime = sla.resolutionTime as Duration;
    const hours = this.durationToHours(resolutionTime);
    
    // Simple calculation - in production, this would account for business hours, weekends, etc.
    const breachTime = new Date(createdAt);
    breachTime.setHours(breachTime.getHours() + hours);

    return breachTime;
  }

  private durationToHours(duration: Duration): number {
    switch (duration.unit) {
      case 'minutes':
        return duration.value / 60;
      case 'hours':
        return duration.value;
      case 'days':
        return duration.value * 24;
      case 'business_days':
        return duration.value * 8; // 8 hours per business day
      default:
        return duration.value;
    }
  }

  private mapSlaToDto(sla: any): SLA {
    return {
      id: sla.id,
      name: sla.name,
      priority: sla.priority as Priority,
      responseTime: sla.responseTime as Duration,
      resolutionTime: sla.resolutionTime as Duration,
      escalationRules: sla.escalationRules as EscalationRule[],
      projectId: sla.projectId,
    };
  }
}

