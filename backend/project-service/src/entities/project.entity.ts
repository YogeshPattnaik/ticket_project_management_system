import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Task } from './task.entity';
import { KanbanBoard } from './kanban-board.entity';
import { Workflow } from './workflow.entity';
import { SLA } from './sla.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, any>;

  @Column({ name: 'organization_id' })
  organizationId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];

  @OneToMany(() => KanbanBoard, (board) => board.project)
  boards!: KanbanBoard[];

  @OneToMany(() => Workflow, (workflow) => workflow.project)
  workflows!: Workflow[];

  @OneToMany(() => SLA, (sla) => sla.project)
  slas!: SLA[];
}

