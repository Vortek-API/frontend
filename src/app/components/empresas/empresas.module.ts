import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresasButtonComponent } from './empresas-button/empresas-button.component';
import { EmpresasListComponent } from './empresas-list/empresas-list.component';



@NgModule({
  declarations: [
    EmpresasButtonComponent,
    EmpresasListComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EmpresasButtonComponent,
    EmpresasListComponent
  ]
})
export class EmpresasModule { }
