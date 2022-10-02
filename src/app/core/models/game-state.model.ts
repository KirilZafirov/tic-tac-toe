export const GAME_STATE = 'GAME_STATE';

export interface GameState {
  playerOne: string;
  playerTwo: string;
  activePlayerOne: boolean;
  selectedFields: number;
  tableState: string;
  gameEnd: boolean;
  gameStarted: boolean;
  scorePlayerOne: number;
  scorePlayerTwo: number;
  matrixOfM: number;
  playerOneSign: string;
  playerTwoSign: string;
  playerOneAvatar: string;
  playerTwoAvatar: string;
  multiplayer: boolean | null;
}

export interface SelectPlayerSign {
  playerOneSign?: string;
  playerTwoSign?: string;
};

export interface UpdatePlayerName {
  playerOne?: string;
  playerTwo?: string;
};