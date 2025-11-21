import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from './project.entity';
import { Comment } from './comment.entity';
import { TaskHistory } from './task-history.entity';

@Entity('tasks')
@Index(['projectId', 'status'])
@Index(['assigneeId'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: 'todo' })
  status!: string;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ name: 'custom_fields', type: 'jsonb', default: {} })
  customFields!: Record<string, any>;

  @Column({ name: 'project_id' })
  projectId!: string;

  @Column({ name: 'assignee_id', nullable: true })
  assigneeId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments!: Comment[];

  @OneToMany(() => TaskHistory, (history) => history.task)
  history!: TaskHistory[];
}

