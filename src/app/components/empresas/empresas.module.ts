import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresasButtonComponent } from './empresas-button/empresas-button.component';



@NgModule({
  declarations: [
    EmpresasButtonComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EmpresasButtonComponent
  ]
})
export class EmpresasModule { }
