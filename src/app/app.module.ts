import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LocalStorageModule } from './core/local-storage/frontend-util-storage.module';
import { PlayerComponent } from './features/player/player.component';
import { TableComponent } from './features/table/table.component';
import { AiPlayerComponent } from './features/ai/ai-player/ai-player.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LocalStorageModule.forRoot(),
    RouterModule,
    TableComponent,
    PlayerComponent,
    AiPlayerComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
