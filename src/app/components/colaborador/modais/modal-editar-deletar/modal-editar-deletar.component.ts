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
    horarioEntrada: '',
    horarioSaida: '',
    statusAtivo: true,
    foto: new Uint8Array()
  };

  empresas: Empresa[] = [];

  imagemBase64: string | null = null;
  imagemPreview: string | null = null;

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
    const primeiraEmpresa = this.colaborador.empresas?.[0];

    if (!primeiraEmpresa) {
      await Swal.fire('Atenção', 'Selecione ao menos uma empresa antes de salvar.', 'warning');
      return;
    }

    const colaboradorEnviado: Colaborador = {
      ...this.colaborador,
      empresas: this.colaborador.empresas?.filter(e => e !== undefined) as Empresa[],
      foto: this.imagemBase64
        ? this.base64ToUint8Array(this.imagemBase64)
        : this.colaborador.foto
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

      // Exibe preview da imagem, se tiver
      if (this.colaborador.foto && this.colaborador.foto.length > 0) {
        const blob = new Blob([this.colaborador.foto], { type: 'image/png' });
        const reader = new FileReader();
        reader.onload = () => {
          this.imagemPreview = reader.result as string;
        };
        reader.readAsDataURL(blob);
      }
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagemBase64 = e.target.result;
        this.imagemPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removerImagem(): void {
    this.imagemBase64 = null;
    this.imagemPreview = null;
    this.colaborador.foto = new Uint8Array();
  }

  base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
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
