import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerComponent } from '../../player/player.component';

@Component({
  selector: 'app-ai-player',
  templateUrl: './ai-player.component.html',
  styleUrls: ['./ai-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class AiPlayerComponent extends PlayerComponent { 
  @Input() aiDifficulties: string[] = [];
  @Input() selectedDifficulty: string = 'Easy';
  @Output() difficulty: EventEmitter<string> = new EventEmitter<string>();

  public selectDifficulty(difficulty: string):void {
    this.difficulty.emit(difficulty);
  }
}
