import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Empresa, EmpresaService } from '../../empresa.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-modal-editar-deletar',
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-editar-deletar.component.html',
  styleUrl: './modal-editar-deletar.component.css'
})
export class ModalEditarDeletarComponent implements OnInit {
  empresa = {
    id: 0,
    nome: '',
    cnpj: '',
    dataCadastro: '',
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

  async deletar(): Promise<void> {
    const confirmacao = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF5350',
      cancelButtonColor: '#0C6834',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
      try {
        const empresaExistente = this.empresas.find(emp => emp.id === this.empresa.id);
        console.log(empresaExistente)

        if (((Array.isArray(empresaExistente?.colaboradores) && empresaExistente.colaboradores.length > 0))) {
          await Swal.fire({
            icon: 'error',
            title: 'Erro ao excluir a empresa! Existem colaboradores relacionados a ela.',
            confirmButtonColor: '#EF5350',
          });
        }
        else {
          await this.empresaService.delete(this.empresa.id);
          await Swal.fire({
            icon: 'success',
            title: 'Empresa excluída com sucesso!',
            confirmButtonColor: '#0C6834',
          });
          this.dialogRef.close(true);
        }
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao excluir a empresa!',
          confirmButtonColor: '#EF5350',
        });
      }
    }
  }

  async save(form:NgForm): Promise<void> {

    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched(); 
      });

      Swal.fire('Atenção', 'Por favor, preencha todos os campos obrigatórios corretamente.', 'warning');
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

      await
        this.empresaService.update(empresaEnviado.id, empresaEnviado);

      await Swal.fire({
        icon: 'success',
        title: 'Empresa atualizada com sucesso!',
        confirmButtonColor: '#0C6834',
      });

      this.dialogRef.close(true);

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao atualizar a empresa!',
        confirmButtonColor: '#EF5350',
      });
    }
  }

  async loadEditData() {
    const { empRet, empsRet } = this.empresaService.getData();
    if (empRet != undefined) {
      this.empresa = empRet;
    }
    this.empresas = empsRet;
  }
}