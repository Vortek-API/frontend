import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmpresaService } from '../empresa.service';

@Component({
  selector: 'app-modal-empresa-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modal-cadastro.component.html',
  styleUrl: './modal-cadastro.component.css'
})
export class ModalCadastroComponent  implements OnInit {
  empresas: any[] = [];
  empresaForm!: FormGroup;
  mensagem = '';
  editando = false;
  idEditando: number | null = null;

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService
  ) {}

  ngOnInit(): void {
  }


  salvarEmpresa() {
    if (this.empresaForm.invalid) {
      this.mensagem = 'Preencha todos os campos obrigatórios!';
      return;
    }

    const empresa = this.empresaForm.value;
    if (this.editando && this.idEditando !== null) {
      this.empresaService.update(this.idEditando, empresa)
        this.mensagem = 'Empresa editada com sucesso!';
        this.cancelarEdicao();
    } else {
      this.empresaService.add(empresa)
        this.mensagem = 'Empresa adicionada com sucesso!';
    }

    this.empresaForm.reset();
  }

  editar(empresa: any) {
    this.editando = true;
    this.idEditando = empresa.id;
    this.empresaForm.patchValue(empresa);
  }

  deletar(id: number) {
    this.empresaService.delete(id)
    this.mensagem = 'Empresa excluída com sucesso!';
  }

  cancelarEdicao() {
    this.editando = false;
    this.idEditando = null;
    this.empresaForm.reset();
  }
}
