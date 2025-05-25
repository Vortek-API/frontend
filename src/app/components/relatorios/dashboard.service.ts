import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Empresa, EmpresaService } from '../empresa/empresa.service';
import { RegistroPontoService } from '../pontos/registro-ponto/registro-ponto.service';

export interface HorasPorEmpresa {
  empresa: Empresa;
  tempo: string;
}
export interface ColaboradoresPorEmpresa {
  empresa: Empresa;
  colaboradoresAtivos: number;
  data: string;
}
export interface AtrasadosPorEmpresa {
  empresa: Empresa;
  colaboradoresAtrasados: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private http: HttpClient,
    private empresaService: EmpresaService,
    private pontoService: RegistroPontoService
  ) { }

  async getHorasPorEmpresa(dataInicio: string, dataFim: string): Promise<HorasPorEmpresa[]> {
    const empresas = await this.empresaService.findAll();
    const resultado: HorasPorEmpresa[] = [];

    for (const empresa of empresas) {
      const registros = await this.pontoService.findByEmpIdIntervData(empresa.id, dataInicio, dataFim);

      const totalSegundos = registros.reduce((acc, registro) => {
        return acc + (registro.tempoTotal ? this.tempoStringParaSegundos(registro.tempoTotal) : 0);
      }, 0);

      resultado.push({
        empresa,
        tempo: this.segundosParaTempoString(totalSegundos)
      });
    }

    return resultado;
  }
  async getColaboradoresAtivosPorEmpresa(dataInicio: string, dataFim: string): Promise<ColaboradoresPorEmpresa[]> {
    const empresas = await this.empresaService.findAll();
    const resultado: ColaboradoresPorEmpresa[] = [];

    for (const empresa of empresas) {
      const registros = await this.empresaService.findColabs(empresa.id);

      const colaboradoresUnicos = new Set<number>();

      registros.forEach(registro => {
        if (registro.id && registro.statusAtivo) {
          colaboradoresUnicos.add(registro.id);
        }
      });

      resultado.push({
        empresa,
        colaboradoresAtivos: colaboradoresUnicos.size,
        data: `${dataInicio} até ${dataFim}`
      });
    }

    return resultado;
  }
  async getColaboradoresInativosPorEmpresa(dataInicio: string, dataFim: string): Promise<ColaboradoresPorEmpresa[]> {
    const empresas = await this.empresaService.findAll();
    const resultado: ColaboradoresPorEmpresa[] = [];

    for (const empresa of empresas) {
      const registros = await this.empresaService.findColabs(empresa.id);

      const colaboradoresUnicos = new Set<number>();

      registros.forEach(registro => {
        if (registro.id && !registro.statusAtivo) {
          colaboradoresUnicos.add(registro.id);
        }
      });

      resultado.push({
        empresa,
        colaboradoresAtivos: colaboradoresUnicos.size,
        data: `${dataInicio} até ${dataFim}`
      });
    }

    return resultado;
  }
  async getAtrasadosPorEmpresa(dataInicio: string, dataFim: string): Promise<AtrasadosPorEmpresa[]> {
    const empresas = await this.empresaService.findAll();
    const resultado: AtrasadosPorEmpresa[] = [];

    for (const empresa of empresas) {
      const registros = await this.pontoService.findByEmpIdIntervData(empresa.id, dataInicio, dataFim);
      const colaboradoresUnicos = new Set<number>();

      await Promise.all(registros.map(async (registro) => {
        const colab = await this.pontoService.find(registro.colaboradorId);
        if (this.stringToDate(registro.horaEntrada) > this.stringToDate(colab.horaEntrada) && registro.id) {
          colaboradoresUnicos.add(registro.id);
        }
      }));

      resultado.push({
        empresa,
        colaboradoresAtrasados: colaboradoresUnicos.size,
      });
    }
    return resultado;
  }
  async getSaidaAdiantadaPorEmpresa(dataInicio: string, dataFim: string): Promise<AtrasadosPorEmpresa[]> {
    const empresas = await this.empresaService.findAll();
    const resultado: AtrasadosPorEmpresa[] = [];

    for (const empresa of empresas) {
      const registros = await this.pontoService.findByEmpIdIntervData(empresa.id, dataInicio, dataFim);
      const colaboradoresUnicos = new Set<number>();

      await Promise.all(registros.map(async (registro) => {
        const colab = await this.pontoService.find(registro.colaboradorId);
        if (this.stringToDate(registro.horaSaida) < this.stringToDate(colab.horaSaida) && registro.id) {
          colaboradoresUnicos.add(registro.id);
        }
      }));

      resultado.push({
        empresa,
        colaboradoresAtrasados: colaboradoresUnicos.size,
      });
    }
    return resultado;
  }


  private tempoStringParaSegundos(tempo: string): number {
    const [horas, minutos, segundos] = tempo.split(':').map(Number);
    return horas * 3600 + minutos * 60 + segundos;
  }

  private segundosParaTempoString(totalSegundos: number): string {
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  }
  private stringToDate(hora: string): Date {
    return new Date(`1970-01-01T${hora}Z`);
  }
}
