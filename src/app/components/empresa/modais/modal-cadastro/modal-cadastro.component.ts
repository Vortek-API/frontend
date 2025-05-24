import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule, NgForm } from '@angular/forms';
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

      console.log(empresaEnviado)

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