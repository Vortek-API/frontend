import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PontoDetalhado, RegistroPontoService } from './registro-ponto.service';
import { Empresa, EmpresaService } from '../../empresa/empresa.service';
import { Colaborador, ColaboradorService } from '../../colaborador/colaborador.service';
import { ExportService } from '../../../services/exports/export.service';
import { ModalEditarComponent } from '../modais/modal-editar.component';
import {  MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-registro-ponto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-ponto.component.html',
  styleUrl: './registro-ponto.component.css'
})

export class RegistroPontoComponent implements OnInit {
  registros: PontoDetalhado[] = [];
  colaboradores: Colaborador[] = [];
  empresas: Empresa[] = [];
  searchTerm: string = '';
  selectedDate: string | null = null;
  selectedEmpresa: number | null = null;

  baixandoRelatorio = false;
  showDownloadOptions = false;

  relatorioData: any[] = []; // Os dados do seu relatório (preenchidos após a filtragem)

  // Objeto de filtros
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
    private exportService: ExportService
  ) { }

  async ngOnInit() {
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

  get registrosFiltrados() {
    return this.registros.filter(r => {
      const colaborador = this.colaboradores.find(c => c.id === r.colaboradorId);
      if (!colaborador) return false;

      const nome = colaborador.nome?.toLowerCase() || '';
      const cpf = colaborador.cpf || '';
      const termoBusca = this.searchTerm.toLowerCase();

      const registroData = r.data?.split('T')[0];
      const atendeBusca = this.searchTerm === '' || nome.includes(termoBusca) || cpf.includes(termoBusca);
      const atendeData = !this.selectedDate || registroData === this.selectedDate;
      const atendeEmpresa = !this.selectedEmpresa || r.empresaId === +this.selectedEmpresa;

      return atendeBusca && atendeData && atendeEmpresa;
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
        cpfColaborador: colaborador?.cpf || '---',
        nomeEmpresa: empresa?.nome || '---',
        dataRegistro: r.data?.split('T')[0] || '',
        entradaRegistro: r.horaEntrada?.split('T')[0]?.substring(0,5) || '',
        saidaRegistro: r.horaSaida?.split('T')[0]?.substring(0,5) || '',
        tempoTotal: r.tempoTotal || '',
      };
    })
    .sort((a, b) => {
      // Primeiro ordena por nome Empresa (A-Z)
      if (a.nomeEmpresa.toLowerCase() < b.nomeEmpresa.toLowerCase()) return -1;
      if (a.nomeEmpresa.toLowerCase() > b.nomeEmpresa.toLowerCase()) return 1;
      // Se a empresa for igual, ordena por nome Colaborador (A-Z)
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
  
}
