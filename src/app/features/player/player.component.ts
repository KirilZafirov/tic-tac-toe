
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, input } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class PlayerComponent {

  player = input.required<string>();
  @Input() playerSign!: string;
  @Input() playerAvatar!: string;
  @Input() score!: number;
  @Input() gameEnd!: boolean;
  @Input() availableSigns!: string[];
  @Input() avatars: string[] = [];
  @Input() disabled: boolean = false

  @Output() selectPlayerSign: EventEmitter<string> = new EventEmitter<string>;
  @Output() selectPlayerAvatar: EventEmitter<string> = new EventEmitter<string>;
  @Output() updatePlayerName: EventEmitter<string> = new EventEmitter<string>;

  public imgSrc = './assets/avatars/';
  public selectSign(sign: string): void {
    this.selectPlayerSign.emit(sign);
  }

  public selectAvatar(avatar: string): void {

    this.selectPlayerAvatar.emit(avatar);
  }

  public changePlayerName(playerName: string): void {
    if (playerName.length > 3) {
      this.updatePlayerName.emit(playerName)
    }
  };

  public trackByIndex(index: number, sign: string): string {
    return sign
  }

}
