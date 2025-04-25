import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PontoDetalhado, RegistroPontoService } from './registro-ponto.service';
import { Empresa, EmpresaService } from '../../empresa/empresa.service';
import { Colaborador, ColaboradorService } from '../../colaborador/colaborador.service';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

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
    private pontoService: RegistroPontoService,
    private empresaService: EmpresaService,
    private colaboradorService: ColaboradorService
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

  toggleDownloadOptions() {
    this.showDownloadOptions = !this.showDownloadOptions;
  }

  downloadCSV() {
    this.baixandoRelatorio = true;
    setTimeout(() => {
      try {
        const csvData = this.convertToCSV(this.relatorioData);
        this.downloadFile(csvData, 'relatorio-horas-por-empresa.csv', 'text/csv');
      } catch (error) {
        console.error('Erro ao gerar CSV:', error);
        alert('Erro ao gerar CSV.');
      } finally {
        this.baixandoRelatorio = false;
        this.showDownloadOptions = false;
      }
    }, 100); // pequeno delay para garantir que o loading apareça
  }
  
  downloadPDF() {
    this.baixandoRelatorio = true;
    setTimeout(() => {
      try {
        const pdf = new jsPDF();
        pdf.text('Relatório de Horas por Empresa', 10, 10);
  
        if (this.filtros.dataInicio || this.filtros.dataFim) {
          let periodoTexto = 'Período: ';
          periodoTexto += this.filtros.dataInicio ? `De ${this.filtros.dataInicio}` : '';
          periodoTexto += this.filtros.dataFim ? ` até ${this.filtros.dataFim}` : '';
          pdf.text(periodoTexto, 10, 20);
        }
  
        pdf.text('Empresa', 10, 30);
        pdf.text('Horas Totais', 100, 30);
        pdf.text('Tempo Formatado', 150, 30);
  
        let y = 40;
        this.relatorioData.forEach(empresa => {
          pdf.text(empresa.empresaNome, 10, y);
          pdf.text(empresa.horasTotais.toString(), 100, y);
          pdf.text(empresa.tempoFormatado, 150, y);
          y += 10;
        });
  
        pdf.save('relatorio-horas-por-empresa.pdf');
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF.');
      } finally {
        this.baixandoRelatorio = false;
        this.showDownloadOptions = false;
      }
    }, 100);
  }
  

  convertToCSV(data: any[]): string {
    if (!data || data.length === 0) {
      return '';
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    return `${headers}\n${rows}`;
  }

  downloadFile(data: string, filename: string, mimeType: string) {
    const blob = new Blob([data], { type: mimeType });
    saveAs(blob, filename);
  }
}
