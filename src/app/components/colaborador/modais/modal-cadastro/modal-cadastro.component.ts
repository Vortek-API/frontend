import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule, NgForm } from '@angular/forms';
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
  imports: [FormsModule, CommonModule, NgxMaskDirective, MatFormFieldModule, MatSelectModule, MatOptionModule,],
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagemPreview = reader.result as string;
        this.imagemBase64 = (reader.result as string)?.split(',')[1] || null; 
      };
      reader.readAsDataURL(file);
    }
  }



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

  async save(form:NgForm): Promise<void> {
    // Verifica se algum campo obrigatório está vazio ou inválido
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched(); 
      });

      Swal.fire('Atenção', 'Por favor, preencha todos os campos obrigatórios corretamente.', 'warning');
      return; 
    }

    try {
      const colaboradorDtoToSend: Colaborador = { ...this.colaborador };

      // Limpa o CPF antes de enviar
      colaboradorDtoToSend.cpf = colaboradorDtoToSend.cpf.replace(/\D/g, '');

      // Adiciona a imagem base64 ao colaborador
      colaboradorDtoToSend.foto = this.imagemBase64;

      //
      const empresasIds: number[] = colaboradorDtoToSend.empresas?.map((empresa) => empresa.id) ?? [];
      delete colaboradorDtoToSend.empresas;

      // Chama o serviço para salvar
      await this.colaboradorService.add(colaboradorDtoToSend,empresasIds);

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
