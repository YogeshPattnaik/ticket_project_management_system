import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KanbanBoard, Column } from '@task-management/interfaces';

interface BoardsState {
  boards: KanbanBoard[];
  selectedBoard: KanbanBoard | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BoardsState = {
  boards: [],
  selectedBoard: null,
  isLoading: false,
  error: null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    fetchBoardStart: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchBoardSuccess: (state, action: PayloadAction<KanbanBoard>) => {
      const index = state.boards.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.boards[index] = action.payload;
      } else {
        state.boards.push(action.payload);
      }
      state.selectedBoard = action.payload;
      state.isLoading = false;
    },
    fetchBoardFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateColumnStart: (
      state,
      action: PayloadAction<{ boardId: string; columnId: string; updates: Partial<Column> }>
    ) => {
      state.isLoading = true;
    },
    updateColumnSuccess: (state, action: PayloadAction<{ boardId: string; column: Column }>) => {
      const board = state.boards.find((b) => b.id === action.payload.boardId);
      if (board) {
        const columnIndex = board.columns.findIndex((c) => c.id === action.payload.column.id);
        if (columnIndex !== -1) {
          board.columns[columnIndex] = action.payload.column;
        }
      }
      if (state.selectedBoard?.id === action.payload.boardId) {
        const columnIndex = state.selectedBoard.columns.findIndex(
          (c) => c.id === action.payload.column.id
        );
        if (columnIndex !== -1) {
          state.selectedBoard.columns[columnIndex] = action.payload.column;
        }
      }
      state.isLoading = false;
    },
    setSelectedBoard: (state, action: PayloadAction<KanbanBoard | null>) => {
      state.selectedBoard = action.payload;
    },
  },
});

export const {
  fetchBoardStart,
  fetchBoardSuccess,
  fetchBoardFailure,
  updateColumnStart,
  updateColumnSuccess,
  setSelectedBoard,
} = boardsSlice.actions;

export default boardsSlice.reducer;

