import { enableProdMode, importProvidersFrom, ɵprovideZonelessChangeDetection } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { RouterModule } from '@angular/router';
import { LocalStorageModule } from './app/core/local-storage/frontend-util-storage.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [importProvidersFrom(BrowserModule, LocalStorageModule.forRoot(), RouterModule),  ɵprovideZonelessChangeDetection()]
})
  .catch(err => console.error(err));
