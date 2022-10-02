import { isPlatformBrowser } from '@angular/common';
import { ModuleWithProviders, NgModule, PLATFORM_ID } from '@angular/core';

import { LocalStorageService, Storage } from './local-storage.service';
import { LOCAL_STORAGE } from './local-storage.token';

// eslint-disable-next-line @typescript-eslint/ban-types
export function localStorageFactory(platformId: Object): Storage | Object {
  if (isPlatformBrowser(platformId) && localStorage) {
    return localStorage;
  }
  return {};
}

@NgModule()
export class LocalStorageModule {
  public static forRoot(): ModuleWithProviders<LocalStorageModule> {
    return {
      ngModule: LocalStorageModule,
      providers: [
        {
          provide: LOCAL_STORAGE,
          useFactory: localStorageFactory,
          deps: [PLATFORM_ID],
        },
        LocalStorageService,
      ],
    };
  }
}
