import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Empresa, EmpresaService } from '../../../empresa/empresa.service';
import { Colaborador, ColaboradorService } from '../../colaborador.service';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';


@Component({
  selector: 'app-modal-cadastro',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxMaskDirective,MatFormFieldModule, MatSelectModule,MatOptionModule,],
  templateUrl: './modal-cadastro.component.html',
  styleUrl: './modal-cadastro.component.css'
})

export class ModalCadastroComponent implements OnInit {
  colaborador: Colaborador = {
    id: 0,
    cpf: '', 
    nome: '',
    cargo: '',
    empresas: [],
    horarioEntrada: '',
    horarioSaida: '',
    statusAtivo: true,
  };

  empresas: Empresa[] = [];

  imagemPreview: string | ArrayBuffer | null = null;
imagemBase64: string | null = null;

onFileSelected(event: any): void {
  const file: File = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagemPreview = reader.result;
      this.imagemBase64 = (reader.result as string).split(',')[1]; // Remove o prefixo "data:image/jpeg;base64,"
    };
    reader.readAsDataURL(file);
  }
}

  constructor(
    public dialogRef: MatDialogRef<ModalCadastroComponent>,
    private colaboradorService: ColaboradorService,
    private empresaService: EmpresaService
  ) {}

  async ngOnInit() {
    this.empresas = await this.empresaService.findAll();
  }

  close(): void {
    this.dialogRef.close();
  }

  async save(): Promise<void> {
    // Verifica se algum campo obrigatório está vazio ou inválido
    if (
      !this.colaborador.nome.trim() ||
      !this.colaborador.cargo.trim() ||
      !this.colaborador.empresas ||
      !this.colaborador.horarioEntrada ||
      !this.colaborador.horarioSaida ||
      this.colaborador.cpf.replace(/\D/g, '').length !== 11
    ) {
      await Swal.fire({
        icon: 'warning',
        title: 'Preencha todos os campos corretamente!',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
  
    try {
      // Limpa o CPF antes de enviar
      this.colaborador.cpf = this.colaborador.cpf.replace(/\D/g, '');
      
       // Adiciona a imagem base64 ao colaborador
     (this.colaborador as any).foto = this.imagemBase64;

      // Chama o serviço para salvar
      await this.colaboradorService.add(this.colaborador);
  
      // Mensagem de sucesso
      await Swal.fire({
        icon: 'success',
        title: 'Colaborador salvo com sucesso!',
        confirmButtonColor: '#3085d6',
      });
  
      // Fecha o modal
      this.dialogRef.close(true);
    } catch (error) {
      // Mensagem de erro genérica
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao salvar o colaborador!',
        confirmButtonColor: '#d33',
      });
    }
  }
  
}
