import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  empresaSelecionada: Empresa;

  constructor(
    private empresaService: EmpresaService,
    public dialogRef: MatDialogRef<ModalEditarDeletarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { empresaSelecionada: Empresa }, // Injete os dados recebidos da empresa clicada
  ) {
    this.empresaSelecionada = data.empresaSelecionada;
  }

  async ngOnInit() {
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
        if (this.empresaSelecionada.colaboradores && this.empresaSelecionada.colaboradores?.length > 0) {
          const confirmacaoRegistro = await Swal.fire({
            title: 'Tem certeza?',
            text: 'Existem colaboradores relacionados a ela.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF5350',
            cancelButtonColor: '#0C6834',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
          });
          if (confirmacaoRegistro.isConfirmed) {
            await this.empresaService.delete(this.empresaSelecionada.id);
            await Swal.fire({
              icon: 'success',
              title: 'Empresa excluída com sucesso!',
              confirmButtonColor: '#0C6834',
            });
            this.dialogRef.close(true);
          }
        }
        else {
          await this.empresaService.delete(this.empresaSelecionada.id);
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

  async save(form: NgForm): Promise<void> {

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

}