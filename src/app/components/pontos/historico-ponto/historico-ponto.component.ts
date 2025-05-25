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
  imagemPreview: string | ArrayBuffer | null = null;

  baixandoRelatorio = false;
  showDownloadOptions = false;
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
    private pontoService: RegistroPontoService,
    private empresaService: EmpresaService,
    private colaboradorService: ColaboradorService,
    private exportService: ExportService
  ) { }

  async ngOnInit() {
    await this.loadRegistroSelecionado();
    await this.loadColaborador();
    await this.loadEmpresas();
    await this.loadRegistros();
  }

  async loadRegistroSelecionado() {
    this.registroSelecionado = this.pontoService.getData();
  }

  async loadColaborador() {
    const colabId = this.registroSelecionado?.colaboradorId;
    if (colabId) this.colaborador = await this.colaboradorService.find(colabId);
    if (this.colaborador?.foto) {
      if (typeof this.colaborador.foto !== 'string') {
        // Se for Uint8Array, converte para Base64
        const binary = this.arrayBufferToBase64(this.colaborador.foto);
        this.imagemPreview = `data:image/jpeg;base64,${binary}`;
      } else {
        this.imagemPreview = `data:image/jpeg;base64,${this.colaborador.foto}`;
      }
    }
  }

  async loadEmpresas() {
    this.empresas = this.colaborador?.empresas ?? [];
  }

  async loadRegistros() {
    const colabId = this.colaborador?.id;
    if (colabId)
      this.registros = await this.pontoService.findByColabId(colabId);
  }

  formatarHora(hora?: string): string {
    return hora ? hora.substring(0, 5) : '--:--';
  }
  formatarCPF(cpf?: string): string {
    if (!cpf) return '---';
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove não dígitos
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  getNomeEmpresa(id: number) {
    return this.empresas.find(e => e.id === id)?.nome || '---';
  }
  get registrosFiltrados() {
    const termoBusca = this.searchTerm?.toLowerCase() || '';
    return this.registros.filter(r => {
      const registroData = new Date(r.data.split('T')[0]);
      const dataInicio = this.filtros.dataInicio ? new Date(this.filtros.dataInicio) : null;
      const dataFim = this.filtros.dataFim ? new Date(this.filtros.dataFim) : null;

      if (dataInicio && registroData < dataInicio) return false;
      if (dataFim) {
        const dataFimMaisUm = new Date(dataFim);
        dataFimMaisUm.setDate(dataFimMaisUm.getDate() + 1);
        if (registroData >= dataFimMaisUm) return false;
      }

      if (this.selectedEmpresa && r.empresaId !== +this.selectedEmpresa) return false;

      return true;
    });
  }

}
