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
export class ModalCadastroComponent implements OnInit {
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
    public dialogRef: MatDialogRef<ModalCadastroComponent>,
    private colaboradorService: ColaboradorService,
    private empresaService: EmpresaService
  ) { }

  async ngOnInit() {
    this.empresas = await this.empresaService.findAll();
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.colaboradorService.add(this.colaborador);
    this.dialogRef.close();
  }
}