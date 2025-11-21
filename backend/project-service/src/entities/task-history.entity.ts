import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('task_history')
@Index(['taskId'])
export class TaskHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'task_id' })
  taskId!: string;

  @Column({ type: 'varchar', length: 100 })
  field!: string;

  @Column({ name: 'old_value', type: 'text', nullable: true })
  oldValue?: string;

  @Column({ name: 'new_value', type: 'text', nullable: true })
  newValue?: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Task, (task) => task.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;
}

