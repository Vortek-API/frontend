import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ModalCadastroComponent } from '../colaborador/modais/modal-cadastro/modal-cadastro.component';
import { MatButtonModule } from '@angular/material/button';
import { Colaborador, ColaboradorService } from './colaborador.service';
import { ModalEditarDeletarComponent } from '../colaborador/modais/modal-editar-deletar/modal-editar-deletar.component';
import { Empresa, EmpresaService } from '../empresa/empresa.service';
import { FormsModule } from '@angular/forms';
import { AuthService, UserLogado } from '../../services/auth/auth.service';
import { ImagePipe } from '../../image.pipe';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-colaborador',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    ImagePipe,
    NgxPaginationModule
  ],
  templateUrl: './colaborador.component.html',
  styleUrls: ['./colaborador.component.css']
})
export class ColaboradorComponent implements OnInit {
  colaboradores: Colaborador[] = [];
  usuarioLogado: UserLogado | undefined;
  empresas: Empresa[] = [];
  selectedEmpresa: number | null = null;
  colaborador: any;
  searchTerm: string = '';
  selectedDate: string | null = null;
  ordenacao: string | null = null;

  isLoading: boolean = true;
  hasNoData: boolean = false;

  itensPorPagina = 10;
  paginaAtual = 1;

  constructor(
    public dialog: MatDialog,
    private colaboradorService: ColaboradorService,
    private empresaService: EmpresaService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    await this.loadUserLogado();
    await this.loadColaboradores(); // Carrega todos inicialmente
    await this.loadEmpresas();
  }

  async loadColaboradores(): Promise<void> {
    this.isLoading = true;
    this.hasNoData = false;
    try {
      this.colaboradores = await this.colaboradorService.findAll();
      this.isLoading = false;
      // hasNoData será determinado pelo getter após filtros
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      this.colaboradores = [];
      this.isLoading = false;
      this.hasNoData = true; // Se falhou ao carregar, não há dados
    }
  }

  async loadEmpresas() {
    try {
      this.empresas = await this.empresaService.findAll() || [];
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      this.empresas = [];
    }
  }

  async loadUserLogado() {
    this.usuarioLogado = await this.authService.getUserLogado();
  }

  async abrirModalCadastro() {
    const dialogRef = this.dialog.open(ModalCadastroComponent, {});
    dialogRef.afterClosed().subscribe(async result => {
        this.colaboradores = await this.colaboradorService.findAll();// Recarrega se houve cadastro
    });
  }

  async abrirModalEditar() {
    // A data já foi setada no clickRow
    const dialogRef = this.dialog.open(ModalEditarDeletarComponent, {});
    dialogRef.afterClosed().subscribe(result => {
        this.loadColaboradores(); // Recarrega se houve edição/deleção
    });
  }

  clickRow(colaborador: Colaborador) {
    this.colaboradorService.setData(colaborador); // Passa os dados para o modal via serviço
    this.abrirModalEditar();
  }

  get colaboradoesFiltrados(): Colaborador[] {
    if (!this.usuarioLogado) {
      return [];
    }

    let empresasDoUsuario: number[] = [];
    if (this.usuarioLogado.grupo === 'EMPRESA') {
      empresasDoUsuario = this.usuarioLogado.empresas.map(e => e.id);
    }

    let filtrados = this.colaboradores.filter(colaborador => {
      const empresasColaborador = colaborador.empresas?.map(e => e.id) || [];
      const temEmpresaEmComum = this.usuarioLogado?.grupo === 'ADMIN' ||
        empresasColaborador.some(id => empresasDoUsuario.includes(id));

      // Filtro por busca (termo)
      const buscaOk = !this.searchTerm || // Se não houver termo, passa
                      colaborador.nome.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Dentro do getter colaboradoesFiltrados, na parte do .filter()

      const selectedEmpresaId = this.selectedEmpresa !== null ? parseInt(this.selectedEmpresa as any, 10) : null;

      let empresaOk = false; // Inicializa como falso
      if (selectedEmpresaId === null) {
        empresaOk = true; // Se nenhuma empresa está selecionada, o colaborador passa neste filtro
      } else {
        // Só chama includes se selectedEmpresaId for um número
        empresaOk = empresasColaborador.includes(selectedEmpresaId);
      }

      return temEmpresaEmComum && buscaOk && empresaOk;
    });

    // Aplica ordenação e outros filtros (data, status)
    if (this.ordenacao === 'alfab') {
      filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    if (this.ordenacao === 'cadastro' && this.selectedDate) {
      filtrados = filtrados.filter(colaborador => {
        const dataColaborador = colaborador.dataCadastro ? new Date(colaborador.dataCadastro).toISOString().split('T')[0] : null;
        return dataColaborador === this.selectedDate;
      });
    }

    if (this.ordenacao === 'ativo') {
      filtrados = filtrados.filter(colaborador => colaborador.statusAtivo === true);
    }

    if (this.ordenacao === 'inativo') {
      filtrados = filtrados.filter(colaborador => colaborador.statusAtivo === false);
    }

    // Atualiza flag hasNoData baseado na lista *filtrada*
    this.hasNoData = !this.isLoading && filtrados.length === 0;

    return filtrados;
  }

  // --- Handlers para resetar a página ao aplicar filtros --- 

  onSearchTermChange(): void {
    this.paginaAtual = 1;
  }

  onDateChange(): void {
    this.paginaAtual = 1;
    // Força ordenação por cadastro se data for selecionada
    if (this.selectedDate) {
      this.ordenacao = 'cadastro';
    }
  }

  onEmpresaChange(): void {
    this.paginaAtual = 1;
  }

  handleOrdenacaoChange() {
    this.paginaAtual = 1;
    if (this.ordenacao !== 'cadastro') {
      this.selectedDate = null;
    }
    // Limpa outros filtros se 'Limpar filtros' for selecionado
    if (!this.ordenacao) {
      this.selectedDate = null;
      this.searchTerm = '';
      this.selectedEmpresa = null;
    }
  }
  // --------------------------------------------------------

  formatarCPF(cpf?: string): string {
    if (!cpf) return '---';
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove não dígitos
    if (cpfLimpo.length !== 11) return cpf; // Retorna original se não tiver 11 dígitos
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}