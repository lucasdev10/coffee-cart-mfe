import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

export const bootstrap = () =>
  bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));
