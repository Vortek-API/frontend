import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpresaService } from './empresa.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit {
  empresas: any[] = [];
  empresaForm!: FormGroup;
  mensagem = '';
  editando = false;
  idEditando: number | null = null;

  constructor(private empresaService: EmpresaService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.listarEmpresas();
    this.empresaForm = this.fb.group({
      nome: ['', Validators.required],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      telefone: ['', Validators.required],
      foto: ['']
    });
  }

  listarEmpresas() {
    this.empresaService.listarEmpresas().subscribe(empresas => {
      this.empresas = empresas;
    });
  }

  salvarEmpresa() {
    if (this.empresaForm.invalid) {
      this.mensagem = 'Preencha todos os campos obrigatórios!';
      return;
    }

    const empresa = this.empresaForm.value;
    if (this.editando && this.idEditando !== null) {
      this.empresaService.editarEmpresa(this.idEditando, empresa).subscribe(() => {
        this.mensagem = 'Empresa editada com sucesso!';
        this.listarEmpresas();
        this.cancelarEdicao();
      });
    } else {
      this.empresaService.adicionarEmpresa(empresa).subscribe(() => {
        this.mensagem = 'Empresa adicionada com sucesso!';
        this.listarEmpresas();
      });
    }

    this.empresaForm.reset();
  }

  editar(empresa: any) {
    this.editando = true;
    this.idEditando = empresa.id;
    this.empresaForm.patchValue(empresa);
  }

  deletar(id: number) {
    this.empresaService.deletarEmpresa(id).subscribe(() => {
      this.mensagem = 'Empresa excluída com sucesso!';
      this.listarEmpresas();
    });
  }

  cancelarEdicao() {
    this.editando = false;
    this.idEditando = null;
    this.empresaForm.reset();
  }
}
