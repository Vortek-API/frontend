import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Empresa, EmpresaService } from '../empresa.service';
import { Colaborador } from '../../colaborador/colaborador.service';

@Component({
  selector: 'app-modal-editar-deletar',
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-editar-deletar.component.html',
  styleUrl: './modal-editar-deletar.component.css'
})
export class ModalEditarDeletarComponent implements OnInit  {
  empresa = {
      id: 0,
      nome: '', 
      cnpj: '',
      colaboradores: [],
    }
    empresas: Empresa[] = [];
  
    constructor(
      private empresaService: EmpresaService,
      public dialogRef: MatDialogRef<ModalEditarDeletarComponent>,
    ) { }
  
    async ngOnInit() {
      this.loadEditData();
    }
  
    close(): void {
      this.dialogRef.close();
    }
    deletar(): void {
      this.empresaService.delete(this.empresa.id);
      this.close();
    }

    save(): void {
      let colaboradores: Colaborador[] = [];
      const empresaEnviado = {
        ...this.empresa,
        empresa: {
          id: Number(this.empresa.id),
          nome: this.empresa.nome,
          cnpj: this.empresa.cnpj,
          colaboradores: colaboradores
        }
      };
      this.empresaService.update(empresaEnviado.id, empresaEnviado);
      this.dialogRef.close();
    }
    loadEditData() {
      const emp = this.empresaService.getData(); 
      if(emp != undefined) {
        this.empresa = emp;
      }
    }
  }