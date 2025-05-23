import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PontoDetalhado, RegistroPontoService } from './registro-ponto.service';
import { Empresa, EmpresaService } from '../../empresa/empresa.service';
import { Colaborador, ColaboradorService } from '../../colaborador/colaborador.service';
import { ExportService } from '../../../services/exports/export.service';
import { ModalEditarComponent } from '../modais/modal-editar.component';
import { MatDialog } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { HistoricoPontosComponent } from '../historico-ponto/historico-ponto.component';
import { AuthService, UserLogado } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-registro-ponto',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './registro-ponto.component.html',
  styleUrls: ['./registro-ponto.component.css']  // corrigido: plural e array
})
export class RegistroPontoComponent implements OnInit {
  registros: PontoDetalhado[] = [];
  colaboradores: Colaborador[] = [];
  usuarioLogado: UserLogado | undefined;
  empresas: Empresa[] = [];
  searchTerm: string = '';
  selectedDate: string | null = null; // Pode remover se não usar mais
  selectedEmpresa: number | null = null;

  baixandoRelatorio = false;
  showDownloadOptions = false;

  itensPorPagina = 10;    // <- definido para controlar paginação
  paginaAtual = 1;

  relatorioData: any[] = [];

  filtros = {
    empresa: '',
    dataInicio: '',
    dataFim: '',
    status: '',
    categoria: '',
    ordenacao: ''
  };

  constructor(
    public dialog: MatDialog,
    private pontoService: RegistroPontoService,
    private empresaService: EmpresaService,
    private colaboradorService: ColaboradorService,
    private exportService: ExportService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    await this.loadUserLogado();
    await this.loadEmpresas();
    await this.loadColaboradores();
    await this.loadRegistros();
  }

  async loadRegistros() {
    this.registros = await this.pontoService.findAll();
  }

  async loadColaboradores() {
    this.colaboradores = await this.colaboradorService.findAll();
  }

  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
  }

  async loadUserLogado() {
    this.usuarioLogado = await this.authService.getUserLogado();
  }

  aplicarFiltros() {
    // Deixe vazio, pois o getter registrosFiltrados já faz o filtro dinâmico
  }

  get registrosFiltrados() {
    return this.registros.filter(r => {
      const colaborador = this.colaboradores.find(c => c.id === r.colaboradorId);
      if (!colaborador) return false;

      const nome = colaborador.nome?.toLowerCase() || '';
      const cpf = colaborador.cpf || '';
      const termoBusca = this.searchTerm.toLowerCase();

      const atendeBusca = this.searchTerm === '' || nome.includes(termoBusca) || cpf.includes(termoBusca);

      const atendeEmpresaSelecionada = !this.selectedEmpresa || r.empresaId === +this.selectedEmpresa;

      let atendeEmpresasUsuario = true;
      if (this.usuarioLogado && this.usuarioLogado.grupo === 'EMPRESA') {
        atendeEmpresasUsuario = this.usuarioLogado.empresas.some(e => e.id === r.empresaId);
      }

      let registroData: Date | null = null;

      if (r.data) {
        const dataString = String(r.data);
        registroData = new Date(dataString.split('T')[0]);
      }

      let atendeDataInicio = true;
      let atendeDataFim = true;

      if (this.filtros.dataInicio && registroData) {
        const dataInicio = new Date(this.filtros.dataInicio);
        atendeDataInicio = registroData >= dataInicio;
      }

      if (this.filtros.dataFim && registroData) {
        const dataFim = new Date(this.filtros.dataFim);
        dataFim.setDate(dataFim.getDate() + 1);
        atendeDataFim = registroData < dataFim;
      }

      return atendeBusca && atendeEmpresaSelecionada && atendeEmpresasUsuario && atendeDataInicio && atendeDataFim;
    });
  }

  getNomeColaborador(id: number) {
    return this.colaboradores.find(c => c.id === id)?.nome || 'Desconhecido';
  }

  getCpfColaborador(id: number) {
    return this.colaboradores.find(c => c.id === id)?.cpf || '---';
  }

  getNomeEmpresa(id: number) {
    return this.empresas.find(e => e.id === id)?.nome || '---';
  }

  prepararRelatorio() {
    this.relatorioData = this.registrosFiltrados.map(r => {
      const colaborador = this.colaboradores.find(c => c.id === r.colaboradorId);
      const empresa = this.empresas.find(e => e.id === r.empresaId);

      return {
        nomeColaborador: colaborador?.nome || 'Desconhecido',
        cpfColaborador: this.formatarCPF(colaborador?.cpf) || '---',
        nomeEmpresa: empresa?.nome || '---',
        dataRegistro: r.data
          ? (() => {
              const [year, month, day] = r.data.split('T')[0].split('-');
              return `${day}/${month}/${year}`;  // corrigido para template literal
            })()
          : '',
        entradaRegistro: r.horaEntrada?.split('T')[0]?.substring(0, 5) || '',
        saidaRegistro: r.horaSaida?.split('T')[0]?.substring(0, 5) || '',
        tempoTotal: r.tempoTotal || '',
      };
    })
    .sort((a, b) => {
      if (a.dataRegistro > b.dataRegistro) return -1;
      if (a.dataRegistro < b.dataRegistro) return 1;

      if (a.nomeEmpresa.toLowerCase() < b.nomeEmpresa.toLowerCase()) return -1;
      if (a.nomeEmpresa.toLowerCase() > b.nomeEmpresa.toLowerCase()) return 1;

      if (a.nomeColaborador.toLowerCase() < b.nomeColaborador.toLowerCase()) return -1;
      if (a.nomeColaborador.toLowerCase() > b.nomeColaborador.toLowerCase()) return 1;

      return 0;
    });
  }

  toggleDownloadOptions() {
    this.showDownloadOptions = !this.showDownloadOptions;
  }

  downloadCSV() {
    this.baixandoRelatorio = true;
    setTimeout(() => {
      try {
        this.prepararRelatorio();
        this.exportService.exportToCSV('relatorio-horas-por-empresa', this.relatorioData);
      } catch (error) {
        console.error('Erro ao gerar CSV:', error);
        alert('Erro ao gerar CSV.');
      } finally {
        this.baixandoRelatorio = false;
        this.showDownloadOptions = false;
      }
    }, 100);
  }

  downloadPDF() {
    this.baixandoRelatorio = true;
    setTimeout(() => {
      try {
        this.prepararRelatorio();
        this.exportService.exportToPDF('relatorio-horas-por-empresa', this.relatorioData);
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF.');
      } finally {
        this.baixandoRelatorio = false;
        this.showDownloadOptions = false;
      }
    }, 100);
  }

  async abrirModalEditar(registro: PontoDetalhado) {
    this.dialog.open(ModalEditarComponent, {
      data: registro
    });
    this.dialog.afterAllClosed.subscribe(async () => {
      await this.loadColaboradores();
    });
  }

  async abrirModalHistorico(registro: PontoDetalhado) {
    this.pontoService.setData(registro);
    this.dialog.open(HistoricoPontosComponent, {
      panelClass: 'no-scroll-dialog'
    });
    this.dialog.afterAllClosed.subscribe(async () => {
      await this.loadColaboradores();
    });
  }

  formatarCPF(cpf?: string): string {
    if (!cpf) return '---';
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
