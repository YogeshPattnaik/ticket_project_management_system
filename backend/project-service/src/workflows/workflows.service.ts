import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Workflow, Trigger, Condition, Action } from '@task-management/interfaces';
import { Logger } from '@task-management/utils';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger('WorkflowsService');

  constructor(private prisma: PrismaService) {}

  async create(workflow: Omit<Workflow, 'id'>): Promise<Workflow> {
    const created = await this.prisma.workflow.create({
      data: {
        name: workflow.name,
        projectId: workflow.projectId,
        triggers: workflow.triggers as any,
        conditions: workflow.conditions as any,
        actions: workflow.actions as any,
        enabled: true,
      },
    });

    this.logger.info(`Workflow created: ${created.name}`);

    return this.mapWorkflowToDto(created);
  }

  async findAll(projectId?: string): Promise<Workflow[]> {
    const workflows = await this.prisma.workflow.findMany({
      where: projectId ? { projectId } : undefined,
    });

    return workflows.map((wf: any) => this.mapWorkflowToDto(wf));
  }

  async findOne(id: string): Promise<Workflow> {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow', id);
    }

    return this.mapWorkflowToDto(workflow);
  }

  async execute(workflowId: string, context: Record<string, unknown>): Promise<void> {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow', workflowId);
    }

    if (!workflow.enabled) {
      this.logger.warn(`Workflow ${workflowId} is disabled`);
      return;
    }

    const conditions = (workflow.conditions as unknown) as Condition[];
    // const triggers = workflow.triggers as Trigger[]; // Available for future use
    const actions = (workflow.actions as unknown) as Action[];

    // Evaluate conditions
    if (!this.evaluateConditions(conditions, context)) {
      this.logger.debug(`Workflow ${workflowId} conditions not met`);
      return;
    }

    // Execute actions
    for (const action of actions) {
      await this.performAction(action, context);
    }

    this.logger.info(`Workflow ${workflowId} executed successfully`);
  }

  private evaluateConditions(conditions: Condition[], context: Record<string, unknown>): boolean {
    if (conditions.length === 0) {
      return true;
    }

    return conditions.every((condition) => {
      const fieldValue = context[condition.field];
      const conditionValue = condition.value;

      switch (condition.operator) {
        case 'equals':
          return fieldValue === conditionValue;
        case 'not_equals':
          return fieldValue !== conditionValue;
        case 'greater_than':
          return Number(fieldValue) > Number(conditionValue);
        case 'less_than':
          return Number(fieldValue) < Number(conditionValue);
        case 'contains':
          return String(fieldValue).includes(String(conditionValue));
        default:
          return false;
      }
    });
  }

  private async performAction(action: Action, _context: Record<string, unknown>): Promise<void> {
    switch (action.type) {
      case 'update_status':
        // This would typically update a task status
        this.logger.debug(`Action: update_status with config ${JSON.stringify(action.config)}`);
        break;
      case 'assign_user':
        this.logger.debug(`Action: assign_user with config ${JSON.stringify(action.config)}`);
        break;
      case 'send_notification':
        this.logger.debug(`Action: send_notification with config ${JSON.stringify(action.config)}`);
        break;
      case 'update_field':
        this.logger.debug(`Action: update_field with config ${JSON.stringify(action.config)}`);
        break;
    }
  }

  private mapWorkflowToDto(workflow: any): Workflow {
    return {
      id: workflow.id,
      name: workflow.name,
      projectId: workflow.projectId,
      triggers: workflow.triggers as Trigger[],
      conditions: workflow.conditions as Condition[],
      actions: workflow.actions as Action[],
    };
  }
}

