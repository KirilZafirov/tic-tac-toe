import { Injectable } from '@angular/core';
import Minimax from 'tic-tac-toe-minimax'
import { GameState } from './core/models/game-state.model';
import { SquarePosition } from './core/models/square.model';
const { ComputerMove } = Minimax;

@Injectable({
  providedIn: 'root'
})
export class AiMoveService { 
  
  public availableAiDifficulties = ['Easy' , 'Normal' , 'Hard'];

  public difficulty = 'Easy';
  public getComputerMove(gameState: GameState, activeBoard: string[][]) : SquarePosition { 
    const symbols = {
       huPlayer: gameState.playerOneSign,
       aiPlayer: gameState.playerTwoSign
   } ;
 
   const board = activeBoard.flatMap( i => i).map( (cell , index) => cell === '' ? index : cell);
   
   const nextMove = ComputerMove( board, symbols, this.difficulty );  

   const row = Math.floor((nextMove / gameState.matrixOfM));
   const column = Math.abs(row * gameState.matrixOfM - nextMove);
  
   return {
    row,
    column
   }
  } 
 
} 