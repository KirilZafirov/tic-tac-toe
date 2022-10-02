import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'; 

@Component({
  selector: 'app-square',
  templateUrl: './square.component.html',
  styleUrls: ['./square.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, 
  standalone: true
})
export class SquareComponent { 
 
  @Input() public squareState: string = '';
  @Input() public gameEnd: boolean = false;
  @Output() public readonly select: EventEmitter<void> = new EventEmitter<void>;


  public onSelect():void {  
    this.select.next();
  }
}
