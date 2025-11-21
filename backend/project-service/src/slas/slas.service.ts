import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SLA as SLAEntity } from '../entities/sla.entity';
import { SLA, Priority, Duration, EscalationRule } from '@task-management/interfaces';
import { Logger } from '@task-management/utils';

@Injectable()
export class SlasService {
  private readonly logger = new Logger('SlasService');

  constructor(
    @InjectRepository(SLAEntity)
    private slaRepository: Repository<SLAEntity>,
  ) {}

  async create(sla: Omit<SLA, 'id'>): Promise<SLA> {
    const created = this.slaRepository.create({
      name: sla.name,
      priority: sla.priority,
      responseTime: sla.responseTime as any,
      resolutionTime: sla.resolutionTime as any,
      escalationRules: sla.escalationRules as any,
      projectId: sla.projectId,
    });

    const saved = await this.slaRepository.save(created);
    this.logger.info(`SLA created: ${saved.name}`);

    return this.mapSlaToDto(saved);
  }

  async findAll(projectId?: string): Promise<SLA[]> {
    const where = projectId ? { projectId } : {};
    const slas = await this.slaRepository.find({
      where,
    });

    return slas.map((sla: any) => this.mapSlaToDto(sla));
  }

  async findOne(id: string): Promise<SLA> {
    const sla = await this.slaRepository.findOne({
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

