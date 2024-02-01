import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject , distinctUntilChanged, Observable } from 'rxjs';
import { AiMoveService } from './ai-move.service'; 
import { AVATARS } from './core/models/avatars.model';
import { GameState } from './core/models/game-state.model';
import { MemoGameState } from './core/models/memo.model';
import { SquarePosition } from './core/models/square.model';

const INITIAL_STATE = {
  playerOne: 'Player One',
  playerTwo: 'Player Two',
  playerOneSign: 'X',
  playerOneAvatar: 'man',
  playerTwoAvatar: 'man',
  playerTwoSign: 'O',
  scorePlayerOne: 0,
  scorePlayerTwo: 0,

  activePlayerOne: true,
  selectedFields: 0,
  tableState: 'Player One turn',
  gameEnd: true,
  gameStarted: false,
  multiplayer: true,
  matrixOfM: 0,

}
@Injectable({
  providedIn: 'root'
})
export class GameService {

  public readonly board$: Observable<string[][]>;
  public readonly gameState = signal<GameState>(INITIAL_STATE);
  public readonly availablePlayerOneSigns = computed(() => {
    const gameState = this.gameState();
    return this.availablePlayerSigns().filter(sign => sign !== gameState.playerTwoSign)
  });
  public readonly availablePlayerTwoSigns = computed(() => {
    const gameState = this.gameState();
    return this.availablePlayerSigns().filter(sign => sign !== gameState.playerOneSign)
  });

  public readonly availableAvatars = signal<string[]>(AVATARS);
  public memoState: MemoGameState = {
    state: [],
    totalMemos: 0,
    currentMemo: 0
  };

  private board$$ = new BehaviorSubject<string[][]>([]);

  private availablePlayerSigns = signal<string[]>(['X', 'O', 'J', 'M']);




  constructor(private aiMoveService: AiMoveService) {

    // this.gameState$$ = new BehaviorSubject<GameState>(localStorageService.getItem(GAME_STATE) || INITIAL_STATE);
    this.board$ = this.board$$.asObservable().pipe(distinctUntilChanged(this.equals));

  }

  public startGame(m: number): void {
    this.board$$.next(this.generateMatrix(m)); 
    this.gameState.update(oldValue => {
      const oldStatePlayerTurn = oldValue.activePlayerOne ? `${oldValue.playerOne} Turn` : `${oldValue.playerTwo} Turn`;
      return {
        ...oldValue,
        gameEnd: false,
        gameStarted: true,
        activePlayerOne: !oldValue.gameStarted ? oldValue.activePlayerOne : true,
        selectedFields: 0,
        tableState: !oldValue.gameStarted ? oldStatePlayerTurn : `${oldValue.playerOne} Turn`,
        matrixOfM: m
      }
    });

    // this.localStorageService.setItem(GAME_STATE, newState);

    this.addMemoState();
  };

  public updateMatrix(squarePosition: SquarePosition): void {
    const state = this.board$$.getValue();
    const gameState = this.gameState();
    const { row, column } = squarePosition;
    const activePlayerOne = gameState.activePlayerOne;
    const activePlayerSign = activePlayerOne ? gameState.playerOneSign : gameState.playerTwoSign;
    let gameWon;
    let noMoreRemainingFields
    state[row][column] = activePlayerSign;


    this.board$$.next(state);
    const updatedBoardState = this.board$$.getValue();
    // We only want to calculate the result if the number of selected fields is bigger then the size of the matrix - 1
    if ((gameState.selectedFields + 1) >= (gameState.matrixOfM * 2) - 1) {
      noMoreRemainingFields = (gameState.selectedFields + 1 === gameState.matrixOfM * gameState.matrixOfM);
      gameWon = this.winConditionMatch(squarePosition, activePlayerSign, gameState.matrixOfM, updatedBoardState);

      this.updateGameState({
        activePlayerOne: !activePlayerOne,
        tableState: this.getTableStateText(gameWon, gameState, noMoreRemainingFields),
        selectedFields: gameState.selectedFields + 1,
        gameEnd: gameWon || noMoreRemainingFields,
        scorePlayerOne: gameWon ? this.newPoints(gameWon, activePlayerOne, gameState.scorePlayerOne) : gameState.scorePlayerOne,
        scorePlayerTwo: gameWon ? this.newPoints(gameWon, !activePlayerOne, gameState.scorePlayerTwo) : gameState.scorePlayerTwo
      });
    } else {
      gameWon = false;
      const tableState = this.getTableStateText(gameWon, gameState, false);
      this.updateGameState({
        activePlayerOne: !activePlayerOne,
        tableState: tableState,
        selectedFields: gameState.selectedFields + 1
      });
    }

    if (activePlayerOne && !gameState.multiplayer && !gameWon && !noMoreRemainingFields) {
      const squarePosition = this.aiMoveService.getComputerMove(this.gameState(), this.board$$.getValue());
      this.updateMatrix(squarePosition);
    }

    this.addMemoState();

  }

  public updateGameState(changedState: Partial<GameState>): void {

    this.gameState.update(oldValue => ({
      ...oldValue,
      ...changedState
    }))
  }

  public updateBoardSigns(sign: string, playerOne: boolean): void {
    const oldState = this.board$$.getValue();
    const { playerOneSign, playerTwoSign } = this.gameState();

    const playerSign = playerOne ? playerOneSign : playerTwoSign;
    const signEquals = (columnSign) => (columnSign === playerSign) ? sign : columnSign;
    const newState = oldState.map(row => row.map(column => signEquals(column)));

    this.board$$.next(newState);
  }

  public undo(): void {
    if (this.memoState.state.length > 1) {
      const oldMemo = this.memoState.state[this.memoState.currentMemo - 2];
      if (oldMemo) {
        this.board$$.next(oldMemo.board);
        this.updateGameState(oldMemo.gameState)
        this.memoState.currentMemo = this.memoState.currentMemo - 1;
      }
    }
  }

  public redo(): void {
    if (this.memoState.state.length > 1) {
      const newMemo = this.memoState.state[this.memoState.currentMemo];
      if (newMemo) {
        this.board$$.next(newMemo.board);
        this.updateGameState(newMemo.gameState)
        this.memoState.currentMemo = this.memoState.currentMemo + 1;
      }
    }
  }


  private addMemoState(): void {
    this.memoState.state.push({
      board: structuredClone(this.board$$.getValue()),
      gameState: structuredClone(this.gameState()),
    });
    this.memoState.totalMemos = this.memoState.state.length;
    this.memoState.currentMemo = this.memoState.currentMemo + 1;
  };

  public resetGame(): void {
    this.updateGameState(INITIAL_STATE)
    this.board$$.next([])
  }

  private winConditionMatch = (squarePosition: SquarePosition, activePlayerSign: string, matrixOfM: number, state: any[][]): boolean =>
    this.horizontalMatch(state, squarePosition, activePlayerSign) ||
    this.verticalMatch(state, squarePosition, activePlayerSign) ||
    this.reverseDiagonalMatch(state, matrixOfM, activePlayerSign) ||
    this.diagonalMatch(state, activePlayerSign)

  private newPoints = (gameWon: boolean, activePlayerOne: boolean, score: number): number => gameWon && activePlayerOne ? score + 1 : score;
  private getTableStateText(gameWon: boolean, gameState: GameState, noMoreRemainingFields: boolean): string {
    const activePlayerWon = gameState.activePlayerOne ? `${gameState.playerOne} Won` : `${gameState.playerTwo} Won`;
    const activePlayerTurn = !gameState.activePlayerOne ? `${gameState.playerOne} Turn` : `${gameState.playerTwo} Turn`;
    return gameWon ? activePlayerWon : noMoreRemainingFields ? "It's a draw" : activePlayerTurn;
  }

  private horizontalMatch = (state: any[][], squarePosition: SquarePosition, activePlayerSign: string): boolean => state[squarePosition.row].every(square => square === activePlayerSign);

  private verticalMatch = (state: any[][], squarePosition: SquarePosition, activePlayerSign: string): boolean => state.every(row => row[squarePosition.column] === activePlayerSign);


  private reverseDiagonalMatch = (state: any[][], matrixOfM: number, activePlayerSign: string): boolean => new Array(matrixOfM).fill(0).map((_, index, array) => ({
    row: array.length - index - 1,
    column: index
  })).every(square => state[square.row][square.column] === activePlayerSign);


  private diagonalMatch = (state: any[][], activePlayerSign: string): boolean => state.reduce((acc, currentRow, index, state) => acc && currentRow[index] === activePlayerSign, true);

  private generateMatrix = (m: number): any[][] => new Array(m).fill(0).map((o, i) => new Array(m).fill(''));

  private equals = (prev: any, curr: any): boolean => JSON.stringify(prev) === JSON.stringify(curr)
}
