import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Empresa, EmpresaService } from '../../../empresa/empresa.service';
import { Colaborador, ColaboradorService } from '../../colaborador.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-editar-deletar',
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './modal-editar-deletar.component.html',
  styleUrl: './modal-editar-deletar.component.css'
})
export class ModalEditarDeletarComponent implements OnInit {
  colaborador: Colaborador = {
    id: 0,
    cpf: '',
    nome: '',
    cargo: '',
    empresas: [],
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
    this.empresas = await this.empresaService.findAll();
    this.loadEditData();
  }

  close(): void {
    this.dialogRef.close();
  }

  async save(): Promise<void> {
    const primeiraEmpresa = this.colaborador.empresas?.[0];

    if (!primeiraEmpresa) {
      await Swal.fire('Atenção', 'Selecione ao menos uma empresa antes de salvar.', 'warning');
      return;
    }

    const colaboradorEnviado: Colaborador = {
      ...this.colaborador,
      empresas: this.colaborador.empresas?.filter(e => e !== undefined) as Empresa[],
    };

    try {
      await this.colaboradorService.update(colaboradorEnviado.id, colaboradorEnviado);
      await Swal.fire('Sucesso', 'Colaborador atualizado com sucesso.', 'success');
      this.close();
    } catch (error) {
      console.error(error);
      await Swal.fire('Erro', 'Erro ao atualizar o colaborador.', 'error');
    }
  }

  async deletar(): Promise<void> {
    try {
      await this.colaboradorService.delete(this.colaborador.id);
      await Swal.fire('Removido', 'Colaborador deletado com sucesso.', 'success');
      this.close();
    } catch (error) {
      console.error(error);
      await Swal.fire('Erro', 'Erro ao deletar o colaborador.', 'error');
    }
  }

  loadEditData(): void {
    const colab = this.colaboradorService.getData();
    if (colab) {
      this.colaborador = {
        ...colab,
        empresas: colab.empresas?.map(empColab => {
          return this.empresas.find(e => e.id === empColab.id) || empColab;
        }) || []
      };
    }
  }

  isEmpresaSelecionada(emp: Empresa): boolean {
    return this.colaborador.empresas?.some(e => e.id === emp.id) ?? false;
  }
  
  toggleEmpresa(emp: Empresa, checked: boolean) {
    if (!this.colaborador.empresas) {
      this.colaborador.empresas = [];
    }
  
    if (checked) {
      const jaExiste = this.colaborador.empresas.some(e => e.id === emp.id);
      if (!jaExiste) {
        this.colaborador.empresas.push(emp);
      }
    } else {
      this.colaborador.empresas = this.colaborador.empresas.filter(e => e.id !== emp.id);
    }
  }
  
}
