import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ColaboradorService, Colaborador } from '../../../colaborador/colaborador.service';
import { Empresa, EmpresaService } from '../../empresa.service';
@Component({
  selector: 'app-modal-cadastro',
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-cadastro.component.html',
  styleUrl: './modal-cadastro.component.css'
})
export class ModalCadastroComponent implements OnInit {
  empresa = {
    id: 0,
    nome: '', 
    cnpj: '',
    colaboradores: [],
  }
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
    let colaboradores: Colaborador[] = [];
    const empresaEnviado = {
      ...this.empresa,
      empresa: {
        id: Number(this.empresa.id),
        nome: this.empresa.nome,
        cnpj: this.empresa.cnpj,
      }
    };
    this.empresaService.add(empresaEnviado);
    this.dialogRef.close();
  }
}