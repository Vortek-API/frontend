import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';




bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

 
