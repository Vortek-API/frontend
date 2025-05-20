import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PontoDetalhado, RegistroPontoService } from '../registro-ponto/registro-ponto.service';
import { Empresa, EmpresaService } from '../../empresa/empresa.service';
import { Colaborador, ColaboradorService } from '../../colaborador/colaborador.service';
import { ExportService } from '../../../services/exports/export.service';

@Component({
  selector: 'app-historico-ponto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historico-ponto.component.html',
  styleUrls: ['./historico-ponto.component.css']
})
export class HistoricoPontosComponent implements OnInit {
  registros: PontoDetalhado[] = [];
  colaborador: Colaborador | undefined;
  registroSelecionado: PontoDetalhado | undefined;
  empresas: Empresa[] = [];
  searchTerm: string = '';
  selectedDate: string | null = null;
  selectedEmpresa: number | null = null;

  baixandoRelatorio = false;
  showDownloadOptions = false;
  relatorioData: any[] = [];

  constructor(
    private pontoService: RegistroPontoService,
    private empresaService: EmpresaService,
    private colaboradorService: ColaboradorService,
    private exportService: ExportService
  ) { }

  async ngOnInit() {
    await this.loadRegistros();
    await this.loadColaborador();
    await this.loadEmpresas();
  }

  async loadRegistros() {
    this.registroSelecionado = this.pontoService.getData();
  }

  async loadColaborador() {
    const colabId = this.registroSelecionado?.colaboradorId;
    if (colabId) this.colaborador = await this.colaboradorService.find(colabId);
  }

  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
  }

  formatarHora(hora?: string): string {
    return hora ? hora.substring(0, 5) : '--:--';
  }
  formatarCPF(cpf?: string): string {
  if (!cpf) return '---';
  const cpfLimpo = cpf.replace(/\D/g, ''); // Remove não dígitos
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}


  // get registrosFiltrados() {
  //   return this.registros.filter(r => {
  //     const colaborador = this.colaborador.find(c => c.id === r.colaboradorId);
  //     if (!colaborador) return false;

  //     const nome = colaborador.nome?.toLowerCase() || '';
  //     const cpf = colaborador.cpf || '';
  //     const termoBusca = this.searchTerm.toLowerCase();

  //     const registroData = r.data?.split('T')[0];
  //     const atendeBusca = this.searchTerm === '' || nome.includes(termoBusca) || cpf.includes(termoBusca);
  //     const atendeData = !this.selectedDate || registroData === this.selectedDate;
  //     const atendeEmpresa = !this.selectedEmpresa || r.empresaId === +this.selectedEmpresa;

  //     return atendeBusca && atendeData && atendeEmpresa;
  //   });
  // }

  // getNomeColaborador(id: number) {
  //   return this.colaboradores.find(c => c.id === id)?.nome || 'Desconhecido';
  // }

  // getCpfColaborador(id: number) {
  //   return this.colaboradores.find(c => c.id === id)?.cpf || '---';
  // }

  // getNomeEmpresa(id: number) {
  //   return this.empresas.find(e => e.id === id)?.nome || '---';
  // }

  // prepararRelatorio() {
  //   this.relatorioData = this.registrosFiltrados.map(r => {
  //     const colaborador = this.colaboradores.find(c => c.id === r.colaboradorId);
  //     const empresa = this.empresas.find(e => e.id === r.empresaId);

  //     return {
  //       nomeColaborador: colaborador?.nome || 'Desconhecido',
  //       cpfColaborador: colaborador?.cpf || '---',
  //       nomeEmpresa: empresa?.nome || '---',
  //       dataRegistro: r.data?.split('T')[0] || '',
  //       entradaRegistro: r.horaEntrada?.substring(11, 16) || '',
  //       saidaRegistro: r.horaSaida?.substring(11, 16) || '',
  //       tempoTotal: r.tempoTotal || ''
  //     };
  //   });
  // }

  // toggleDownloadOptions() {
  //   this.showDownloadOptions = !this.showDownloadOptions;
  // }

  // downloadCSV() {
  //   this.baixandoRelatorio = true;
  //   setTimeout(() => {
  //     try {
  //       this.prepararRelatorio();
  //       this.exportService.exportToCSV('historico-ponto', this.relatorioData);
  //     } catch (error) {
  //       console.error('Erro ao gerar CSV:', error);
  //       alert('Erro ao gerar CSV.');
  //     } finally {
  //       this.baixandoRelatorio = false;
  //       this.showDownloadOptions = false;
  //     }
  //   }, 100);
  // }

  // downloadPDF() {
  //   this.baixandoRelatorio = true;
  //   setTimeout(() => {
  //     try {
  //       this.prepararRelatorio();
  //       this.exportService.exportToPDF('historico-ponto', this.relatorioData);
  //     } catch (error) {
  //       console.error('Erro ao gerar PDF:', error);
  //       alert('Erro ao gerar PDF.');
  //     } finally {
  //       this.baixandoRelatorio = false;
  //       this.showDownloadOptions = false;
  //     }
  //   }, 100);
  // }
}
