import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { AiMoveService } from './ai-move.service';
import { LocalStorageService } from './core/local-storage/local-storage.service';
import { AVATARS } from './core/models/avatars.model';
import { GameState, GAME_STATE } from './core/models/game-state.model';
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
  multiplayer: null,
  matrixOfM: 0,
  
}
@Injectable({
  providedIn: 'root'
})
export class GameService {

  public readonly board$: Observable<string[][]>;
  public readonly gameState$: Observable<GameState>;
  public readonly availablePlayerOneSigns$: Observable<string[]>;
  public readonly availablePlayerTwoSigns$: Observable<string[]>;
  public readonly availableAvatars$: Observable<string[]>; 
  public memoState: MemoGameState= {
    state: [],
    totalMemos: 0,
    currentMemo: 0
  };
  
  private board$$ = new BehaviorSubject<string[][]>([]); 
  private gameState$$: BehaviorSubject<GameState>;
  private availablePlayerSigns$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['X', 'O', 'J', 'M']);
  private availableAvatars$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(AVATARS);
  
 

  constructor(private readonly localStorageService: LocalStorageService , private aiMoveService: AiMoveService) { 
    this.gameState$$ = new BehaviorSubject<GameState>(localStorageService.getItem(GAME_STATE) || INITIAL_STATE);

    this.board$ = this.board$$.asObservable().pipe(distinctUntilChanged(this.equals));
    this.gameState$ = this.gameState$$.asObservable().pipe(distinctUntilChanged(this.equals));
    this.availableAvatars$ =  this.availableAvatars$$.asObservable();

    this.availablePlayerOneSigns$ = combineLatest([
      this.gameState$$.asObservable().pipe(map((gameState: GameState) => gameState.playerTwoSign)),
      this.availablePlayerSigns$$.asObservable()]).pipe(
        map(([playerTwoSign, availablePlayerSigns]) => availablePlayerSigns.filter(sign => sign !== playerTwoSign))
      );

    this.availablePlayerTwoSigns$ = combineLatest([
      this.gameState$$.asObservable().pipe(map((gameState: GameState) => gameState.playerOneSign)),
      this.availablePlayerSigns$$.asObservable()]).pipe(
        map(([playerOneSign, availablePlayerSigns]) => availablePlayerSigns.filter(sign => sign !== playerOneSign))
      ); 
  }

  public startGame(m: number): void {
    this.board$$.next(this.generateMatrix(m));

    const oldState = this.gameState$$.value;
    const oldStatePlayerTurn = oldState.activePlayerOne ? `${oldState.playerOne} Turn` : `${oldState.playerTwo} Turn`;

    const newState = {
      ...oldState,
      gameEnd: false,
      gameStarted: true,
      activePlayerOne: !oldState.gameStarted ? oldState.activePlayerOne : true,
      selectedFields: 0,
      tableState: !oldState.gameStarted ? oldStatePlayerTurn : `${oldState.playerOne} Turn`,
      matrixOfM: m
    };

    this.gameState$$.next(newState);
    this.localStorageService.setItem(GAME_STATE , newState);  
    
    this.addMemoState();
  }; 

  public updateMatrix(squarePosition: SquarePosition): void {
    const state = this.board$$.getValue();
    const gameState = this.gameState$$.getValue();
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
        scorePlayerOne: gameWon ? this.newPoints(gameWon, activePlayerOne, gameState.scorePlayerOne): gameState.scorePlayerOne,
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

    if(activePlayerOne && !gameState.multiplayer && !gameWon && !noMoreRemainingFields) {
      const squarePosition = this.aiMoveService.getComputerMove(this.gameState$$.getValue() , this.board$$.getValue()); 
      this.updateMatrix(squarePosition);
    }

    this.addMemoState();

  }

  public updateGameState(changedState: Partial<GameState>): void {
    const oldState = this.gameState$$.getValue();

    const newState = {
      ...oldState,
      ...changedState
    };

    this.gameState$$.next(newState);
  }

  public updateBoardSigns(sign: string, playerOne: boolean): void {
    const oldState = this.board$$.getValue();
    const { playerOneSign, playerTwoSign } = this.gameState$$.getValue();

    const playerSign = playerOne ? playerOneSign : playerTwoSign;
    const signEquals = (columnSign) => (columnSign === playerSign) ? sign : columnSign;
    const newState = oldState.map(row => row.map(column => signEquals(column)));

    this.board$$.next(newState);
  }
 
  public undo(): void { 
    if(this.memoState.state.length > 1) {
      const oldMemo =  this.memoState.state[this.memoState.currentMemo - 2];
      if(oldMemo) {
        this.board$$.next(oldMemo.board);
        this.gameState$$.next(oldMemo.gameState); 
        this.memoState.currentMemo = this.memoState.currentMemo - 1;
      } 
    } 
  }
   
  public redo(): void {
    if(this.memoState.state.length > 1) {
      const newMemo =  this.memoState.state[this.memoState.currentMemo];
      if(newMemo) {
        this.board$$.next(newMemo.board);
        this.gameState$$.next(newMemo.gameState); 
        this.memoState.currentMemo = this.memoState.currentMemo + 1;
      } 
    } 
  } 
  

  private addMemoState():void { 
    this.memoState.state.push({
      board: structuredClone(this.board$$.getValue()),
      gameState: structuredClone(this.gameState$$.getValue()), 
    });
    this.memoState.totalMemos = this.memoState.state.length;
    this.memoState.currentMemo =  this.memoState.currentMemo + 1; 
  };

  public resetGame():void {
    this.gameState$$.next(INITIAL_STATE);
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
    return gameWon ? activePlayerWon: noMoreRemainingFields ? 'It is a draw' : activePlayerTurn;
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
