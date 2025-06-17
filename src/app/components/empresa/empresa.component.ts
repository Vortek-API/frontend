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

  empresasExibidas: Empresa[] = [];

  isLoading: boolean = true; // Para mostrar um carregando enquanto espera os dados
  hasNoData: boolean = false; // Propriedade para controlar a exibição da mensagem

  itensPorPagina = 20;
  paginaAtual = 1;

  constructor(
    private empresaService: EmpresaService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.carregarEmpresas();
  }

  async carregarEmpresas(): Promise<void> {
    this.isLoading = true;
    this.hasNoData = false;
    this.paginaAtual = 1;

    try {
      const data: Empresa[] = await this.empresaService.findAll();
      this.empresas = data || [];
      this.isLoading = false;
      this.hasNoData = this.empresas.length === 0;

      this.aplicarFiltrosEOrdenacao();

    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      this.empresas = []; // Limpa a lista em caso de erro
      this.empresasExibidas = []; // Limpa também a lista exibida
      this.isLoading = false;
      this.hasNoData = true; // Exibe a mensagem de "sem dados" ou "erro ao carregar"
    }
  }

  aplicarFiltrosEOrdenacao(): void {
    let filtradas = [...this.empresas]; // Começa com a lista completa

    // Aplica filtro por termo de busca
    if (this.searchTerm) {
      filtradas = filtradas.filter(empresa =>
        empresa.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        empresa.cnpj.includes(this.searchTerm) // Supondo que cnpj é string
      );
    }

    // Aplica ordenação
    if (this.ordenacao === 'alfab') {
      filtradas.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (this.ordenacao === 'cadastro' && this.selectedDate) {
      // Filtrar por data de cadastro
      filtradas = filtradas.filter(empresa => {
        // Assegura que dataCadastro existe e é uma string antes de tentar split
        const dataEmpresa = empresa.dataCadastro ? new Date(empresa.dataCadastro).toISOString().split('T')[0] : null;
        return dataEmpresa === this.selectedDate;
      });
    }

    this.empresasExibidas = filtradas; // Atualiza a lista que será usada no *ngFor
  }

  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
  }

  openModalCadastro() {
    this.dialog.open(ModalCadastroComponent, {});
    this.dialog.afterAllClosed.subscribe(() => this.carregarEmpresas());
  }

  openModalEditar() {
    this.dialog.open(ModalEditarDeletarComponent, {});
    this.dialog.afterAllClosed.subscribe(() => this.carregarEmpresas());
  }

  clickRow(empresa: Empresa) {
    const dialogRef = this.dialog.open(ModalEditarDeletarComponent, {
      data: { empresaSelecionada: empresa }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregarEmpresas(); // Recarrega os dados
      }
    });
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

    this.aplicarFiltrosEOrdenacao();
  }

  onSearchTermChange(): void {
    this.paginaAtual = 1;
    this.aplicarFiltrosEOrdenacao();
  }

  formatarCNPJ(cnpj?: string): string {
    if (!cnpj) return '---';
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return cnpj;
    return cnpjLimpo.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  }
}