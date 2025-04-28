import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ColaboradorService, Colaborador } from '../../../colaborador/colaborador.service';
import { Empresa, EmpresaService } from '../../empresa.service';
import Swal from 'sweetalert2';

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

  async save(): Promise<void> {

    if (!this.empresa.nome.trim() || !this.empresa.cnpj.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Preencha todos os campos obrigatórios!',
      });
      return;
    }

    try {
      const empresaEnviado = {
        ...this.empresa,
        empresa: {
          id: Number(this.empresa.id),
          nome: this.empresa.nome,
          cnpj: this.empresa.cnpj,
        }
      };

      await this.empresaService.add(empresaEnviado);

      await Swal.fire({
        icon: 'success',
        title: 'Empresa salva com sucesso!',
        confirmButtonColor: '#0C6834',
      });

      this.dialogRef.close(true);

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao salvar a empresa!',
        confirmButtonColor: '#EF5350',
      });
    }
  }
}