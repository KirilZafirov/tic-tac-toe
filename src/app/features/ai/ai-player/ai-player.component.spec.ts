import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiPlayerComponent } from './ai-player.component';

describe('AiPlayerComponent', () => {
  let component: AiPlayerComponent;
  let fixture: ComponentFixture<AiPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AiPlayerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
