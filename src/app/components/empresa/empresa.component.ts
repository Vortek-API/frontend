import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Empresa, EmpresaService } from './empresa.service';
import { ModalCadastroComponent } from './modais/modal-cadastro/modal-cadastro.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalEditarDeletarComponent } from './modais/modal-editar-deletar/modal-editar-deletar.component';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit {
  empresas: Empresa[] = [];
  searchTerm: string = '';
  ordenacao: string | null = null;
  selectedDate: string | null = null;

  itensPorPagina = 20;
  paginaAtual = 1;

  constructor(
    private empresaService: EmpresaService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadEmpresas();
  }

  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
  }

  openModalCadastro() {
    this.dialog.open(ModalCadastroComponent, {});
    this.dialog.afterAllClosed.subscribe(() => this.loadEmpresas());
  }

  openModalEditar() {
    this.dialog.open(ModalEditarDeletarComponent, {});
    this.dialog.afterAllClosed.subscribe(() => this.loadEmpresas());
  }

  clickRow(empresa: Empresa) {
    this.empresaService.setData(empresa, this.empresas);
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
        const dataEmpresa = empresa.dataCadastro?.split('T')[0];
        return dataEmpresa === this.selectedDate;
      });
    }

    return filtradas;
  }

  handleOrdenacaoChange() {
    this.paginaAtual = 1;

    if (this.ordenacao !== 'cadastro') {
      this.selectedDate = null;
    }

    if (!this.ordenacao) {
      this.selectedDate = null;
      this.searchTerm = '';
    }
  }
}
