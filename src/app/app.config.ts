import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';  // Importando a função provideHttpClient
import { routes } from './app.routes';
import { CommonModule } from '@angular/common';
import { provideNgxMask } from 'ngx-mask';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),  // Adicionando o provideHttpClient
    provideNgxMask(),
    CommonModule
  ]
};