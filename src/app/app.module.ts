import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmpresasModule } from './components/empresas/empresas.module';
import { FuncionariosModule } from './components/funcionarios/funcionarios.module';
import { MenusModule } from './components/menus/menus.module';
import { EmpresasButtonComponent } from './components/empresas/empresas-button/empresas-button.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    LucideAngularModule,
    BrowserModule,
    AppRoutingModule,
    EmpresasModule,
    FuncionariosModule,
    MenusModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
