import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { KanbanBoard } from './kanban-board.entity';

@Entity('board_columns')
@Index(['boardId'])
export class BoardColumn {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'board_id' })
  boardId!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'jsonb' })
  statuses!: string[];

  @Column({ type: 'int', nullable: true })
  limit?: number;

  @Column({ type: 'varchar', length: 7 })
  color!: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => KanbanBoard, (board) => board.columns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board!: KanbanBoard;
}

