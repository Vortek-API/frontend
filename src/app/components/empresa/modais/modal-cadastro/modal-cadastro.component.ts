import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ColaboradorService, Colaborador } from '../../../colaborador/colaborador.service';
import { Empresa, EmpresaService } from '../../empresa.service';

@Component({
  selector: 'app-modal-cadastro',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-cadastro.component.html',
  styleUrl: './modal-cadastro.component.css'
})
export class ModalCadastroComponent implements OnInit {
  colaborador: Partial<Colaborador> = {
    nome: '',
    cpf: '',
    cargo: '',
    hora_ent: '',
    hora_sai: '',
    status: true,
    empresas: [] // <- múltiplas empresas aqui
  };

  empresas: Empresa[] = [];
  empresasSelecionadas: number[] = [];

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

  async save(): Promise<void> {
    const empresasSelecionadas: Empresa[] = this.empresas.filter(e => this.empresasSelecionadas.includes(e.id));

    const novoColaborador: Colaborador = {
      ...(this.colaborador as Colaborador),
      empresas: empresasSelecionadas
    };

    await this.colaboradorService.add(novoColaborador);
    this.dialogRef.close();
  }
}
