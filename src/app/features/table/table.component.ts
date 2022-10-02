import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'; 
import { GameState } from 'src/app/core/models/game-state.model';
import { SquarePosition } from 'src/app/core/models/square.model';
import { SquareComponent } from '../square/square.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SquareComponent , CommonModule],
  standalone: true
})
export class TableComponent {  
  @Input() public matrix!: any[][] | null;  
  @Input() public gameState!: GameState;
  @Output() public readonly select: EventEmitter<SquarePosition> = new EventEmitter<SquarePosition>;
  
  public selectSquare(row:number, column: number):void { 
    this.select.next({ row , column});
  }
}
