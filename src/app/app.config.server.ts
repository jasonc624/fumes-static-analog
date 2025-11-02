import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { appConfig } from './app.config';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { environment } from './config/environment';
import { LIB_ENV } from '@fumes/services';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

const serverConfig: ApplicationConfig = {
  providers: [
    { provide: LIB_ENV, useValue: environment },
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    provideServerRendering(),
    provideNoopAnimations()
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
