import { GameState } from "./game-state.model";

export interface Memo {
  board: string[][];
  gameState: GameState;
}
export interface MemoGameState {
  state: Memo[ ],
  totalMemos: number;
  currentMemo: number;
}