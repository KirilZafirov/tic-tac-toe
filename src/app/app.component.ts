import { Component } from '@angular/core';
import { GameService } from './game-service.service';
import { SquarePosition } from './core/models/square.model';
import { GAME_STATE, SelectPlayerSign, UpdatePlayerName } from './core/models/game-state.model';
import { AiMoveService } from './ai-move.service';
import { LocalStorageService } from './core/local-storage/local-storage.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  public readonly board$ = this.gameService.board$.pipe(
    tap( board => this.showStatistics = board.length > 1)
  );
  public readonly gameState$ = this.gameService.gameState$;
  public readonly availablePlayerOneSigns$ = this.gameService.availablePlayerOneSigns$;
  public readonly availablePlayerTwoSigns$ = this.gameService.availablePlayerTwoSigns$;
  public readonly availableAvatars$ = this.gameService.availableAvatars$;
  public readonly aiDifficulties = this.aiMoveService.availableAiDifficulties;
  public showStatistics: boolean =  false;
  constructor(private gameService: GameService,
    private aiMoveService: AiMoveService,
    private localStorageService: LocalStorageService) { }

  public startGame(): void {
    this.gameService.startGame(3);
  }

  public reset() {
    this.gameService.resetGame();
    this.localStorageService.removeItem(GAME_STATE);
  }
  public selectSign(sign: string, playerOne: boolean): void {
    const signToUpdate: SelectPlayerSign = playerOne ? {
      playerOneSign: sign,
    } : {
      playerTwoSign: sign,
    }
    this.gameService.updateBoardSigns(sign, playerOne);
    this.gameService.updateGameState(signToUpdate);
  }

  public selectAvatar(avatar: string, playerOne: boolean): void {
    const playerAvatar = playerOne ? {
      playerOneAvatar: avatar,
    } : {
      playerTwoAvatar: avatar,
    }
    this.gameService.updateGameState(playerAvatar);
  }

  public changePlayerName(playerName: string, playerOne: boolean): void {
    const nameToUpdate: UpdatePlayerName = playerOne ? {
      playerOne: playerName
    } : {
      playerTwo: playerName
    }
    this.gameService.updateGameState(nameToUpdate);
  };

  public changeState(squarePosition: SquarePosition): void {
    this.gameService.updateMatrix(squarePosition)
  }

  public changeDifficulty(difficulty: string): void {
    this.aiMoveService.difficulty = difficulty;
  }

  public selectGameType(multiplayer: boolean): void {
    this.gameService.updateGameState({ multiplayer: multiplayer });
  }

  public playerTwoGoesFirst(): void {
    this.gameService.updateGameState({ activePlayerOne: false });
  }
}
