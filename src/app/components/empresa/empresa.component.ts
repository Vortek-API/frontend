import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Empresa, EmpresaService } from './empresa.service';
import { ModalCadastroComponent } from './modais/modal-cadastro/modal-cadastro.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalEditarDeletarComponent } from './modais/modal-editar-deletar/modal-editar-deletar.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit {
  empresas: Empresa[] = [];
  searchTerm: string = '';
  ordenacaoSelecionada: string | null = null;
  selectedDate: string | null = null;
  ordenacao: string | null = null;


  constructor(
    private empresaService: EmpresaService,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.loadEmpresas();
  }

  openModalCadastro() {
    this.dialog.open(ModalCadastroComponent, {
      width: '400px',
      height: '28%',
    });

    this.dialog.afterAllClosed.subscribe(() => {
      setTimeout(async () => {
        await this.loadEmpresas();
      }, 5000);

      setTimeout(async () => {
        await this.loadEmpresas();
      }, 30001);
    });
  }
  openModalEditar() {
    this.dialog.open(ModalEditarDeletarComponent, {
      width: '500px',
      height: '28%',
    });

    this.dialog.afterAllClosed.subscribe(() => {
      setTimeout(async () => {
        await this.loadEmpresas();
      }, 5000);

      setTimeout(async () => {
        await this.loadEmpresas();
      }, 30001);
    });
  }
  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
  }
  clickRow(empresa: Empresa) {
    this.empresaService.setData(empresa);
    this.openModalEditar();
  }
  get empresasFiltradas(): Empresa[] {
    let filtradas = this.empresas.filter(empresa =>
      empresa.nome.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    if (this.ordenacao === 'alfab') {
      filtradas.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    if (this.ordenacao === 'cadastro' && this.selectedDate) {
      filtradas = filtradas.filter(empresa => {
        const dataEmpresa = empresa.dataCadastro?.split('T')[0]; // pega só "2025-04-14"
        return dataEmpresa === this.selectedDate;
      });
    }
    return filtradas;
  }
  handleOrdenacaoChange() {
    // Resetar data se saiu da ordenação por cadastro
    if (this.ordenacao !== 'cadastro') {
      this.selectedDate = null;
    }
  
    // Se limpou os filtros
    if (!this.ordenacao) {
      this.selectedDate = null;
      this.searchTerm = '';
    }
  }
}