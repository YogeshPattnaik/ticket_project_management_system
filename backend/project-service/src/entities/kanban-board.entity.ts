import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { BoardColumn } from './board-column.entity';

@Entity('kanban_boards')
export class KanbanBoard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'project_id' })
  projectId!: string;

  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Project, (project) => project.boards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @OneToMany(() => BoardColumn, (column) => column.board, { cascade: true })
  columns!: BoardColumn[];
}

