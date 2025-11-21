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

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'project_id' })
  projectId!: string;

  @Column({ type: 'jsonb' })
  triggers!: any[];

  @Column({ type: 'jsonb' })
  conditions!: any[];

  @Column({ type: 'jsonb' })
  actions!: any[];

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Project, (project) => project.workflows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;
}

