import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Empresa, EmpresaService } from '../../../empresa/empresa.service';
import { Colaborador, ColaboradorService } from '../../colaborador.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-cadastro',
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-cadastro.component.html',
  styleUrl: './modal-cadastro.component.css'
})
export class ModalCadastroComponent implements OnInit, OnDestroy  {
  colaborador = {
    id: 0,
    cpf: '', 
    nome: '',
    cargo: '',
    empresa: {
      id: 0,
    },
    hora_ent: '',
    hora_sai: '',
    status: true,
  };
  empresas: Empresa[] = [];

  isEdit: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ModalCadastroComponent>,
    private colaboradorService: ColaboradorService,
    private empresaService: EmpresaService
  ) { }

  async ngOnInit() {
    this.loadEditData();
    console.log(this.isEdit)
    this.empresas = await this.empresaService.findAll();
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    console.log(this.colaborador)
    if (this.isEdit) {
      this.isEdit = false;
      this.colaboradorService.update(this.colaborador.id, this.colaborador);
      return;
    }
    this.colaboradorService.add(this.colaborador);
    this.dialogRef.close(this.colaborador);
  }
  loadEditData() {
    console.log('recebeu')
    const colab = this.colaboradorService.getData(); 
    if(colab != undefined) {
      this.colaborador = colab;
      this.isEdit = true;
    }
    else this.isEdit = false;
  }
  ngOnDestroy(): void {
    this.close();
    this.isEdit = false;
  }
}