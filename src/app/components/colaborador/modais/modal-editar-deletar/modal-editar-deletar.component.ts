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
  styleUrls: ['./modal-editar-deletar.component.css']
})
export class ModalEditarDeletarComponent implements OnInit {
  colaborador: Colaborador = {
    id: 0,
    cpf: '',
    nome: '',
    cargo: '',
    empresas: [],
    horarioEntrada: '',
    horarioSaida: '',
    statusAtivo: true,
    foto: new Uint8Array()
  };

  empresas: Empresa[] = [];

  imagemBase64: string | null = null;
  imagemPreview: string | Uint8Array = new Uint8Array();

  constructor(
    public dialogRef: MatDialogRef<ModalEditarDeletarComponent>,
    private colaboradorService: ColaboradorService,
    private empresaService: EmpresaService
  ) {}

  async ngOnInit() {
    this.empresas = await this.empresaService.findAll();
    this.loadEditData();
  }

  close(): void {
    this.dialogRef.close();
  }

  async save(): Promise<void> {
    // const primeiraEmpresa = this.colaborador.empresas?.[0];

    // if (!primeiraEmpresa) {
    //   await Swal.fire('Atenção', 'Selecione ao menos uma empresa antes de salvar.', 'warning');
    //   return;
    // }

    const colaboradorEnviado: Colaborador = {
      ...this.colaborador,
      empresas: this.colaborador.empresas?.filter(e => e !== undefined) as Empresa[],
      foto: this.imagemBase64 ? this.removeBase64Prefix(this.imagemBase64) : this.colaborador.foto
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
      if (await this.colaboradorService.hasRegistro(this.colaborador.id)) {
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao excluir o colaborador! Existem registros relacionados.',
          confirmButtonColor: '#EF5350',
        });
      }
      else {
        await this.colaboradorService.delete(this.colaborador.id);
        await Swal.fire('Removido', 'Colaborador deletado com sucesso.', 'success');
        this.close();
      }
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

      if (this.colaborador.foto) {
        if (typeof this.colaborador.foto !== 'string') {
          // Se for Uint8Array, converte para Base64
          const binary = this.arrayBufferToBase64(this.colaborador.foto);
          this.imagemPreview = `data:image/jpeg;base64,${binary}`;
        } else {
          this.imagemPreview = `data:image/jpeg;base64,${this.colaborador.foto}`;
        }
      }
    }
  }

  // Função auxiliar:
  arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }


  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagemBase64 = e.target.result as string;  // A imagem será manipulada como string Base64
        this.imagemPreview = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removerImagem(): void {
    this.imagemBase64 = null;
    this.imagemPreview = new Uint8Array();
    this.colaborador.foto = '';  // Alterado para string vazia
  }

  removeBase64Prefix(base64: string): string {
    return base64.split(',')[1]; // Remove a parte `data:image/jpeg;base64,`
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
