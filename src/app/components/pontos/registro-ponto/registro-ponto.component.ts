import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PontoDetalhado, RegistroPontoService } from './registro-ponto.service';
import { Empresa, EmpresaService } from '../../empresa/empresa.service';
import { Colaborador, ColaboradorService } from '../../colaborador/colaborador.service';

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
}
