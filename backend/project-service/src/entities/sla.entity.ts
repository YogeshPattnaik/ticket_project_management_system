import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('slas')
export class SLA {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  priority!: string;

  @Column({ name: 'response_time', type: 'jsonb' })
  responseTime!: any;

  @Column({ name: 'resolution_time', type: 'jsonb' })
  resolutionTime!: any;

  @Column({ name: 'escalation_rules', type: 'jsonb' })
  escalationRules!: any[];

  @Column({ name: 'project_id' })
  projectId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Project, (project) => project.slas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;
}

