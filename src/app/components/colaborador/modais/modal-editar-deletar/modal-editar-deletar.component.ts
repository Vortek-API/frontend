import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Empresa, EmpresaService } from '../../../empresa/empresa.service';
import { Colaborador, ColaboradorService } from '../../colaborador.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-editar-deletar',
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-editar-deletar.component.html',
  styleUrl: './modal-editar-deletar.component.css'
})
export class ModalEditarDeletarComponent implements OnInit, OnDestroy  {
  colaborador = {
    id: 0,
    cpf: '', 
    nome: '',
    cargo: '',
    empresa: {
      id: 0,
      nome: '',
      cnpj: '',
    },
    hora_ent: '',
    hora_sai: '',
    status: true,
  };
  empresas: Empresa[] = [];

  constructor(
    public dialogRef: MatDialogRef<ModalEditarDeletarComponent>,
    private colaboradorService: ColaboradorService,
    private empresaService: EmpresaService
  ) { }

  async ngOnInit() {
    this.loadEditData();
    this.empresas = await this.empresaService.findAll();
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.colaboradorService.add(this.colaborador);
    this.close();
  }
  deletar(): void {
    this.colaboradorService.delete(this.colaborador.id);
    this.close();
  }
  loadEditData() {
    console.log('recebeu')
    const colab = this.colaboradorService.getData(); 
    if(colab != undefined) {
      this.colaborador = colab;
    }
  }
  ngOnDestroy(): void {
    this.close();
  }
}