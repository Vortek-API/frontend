import { Component, OnInit } from '@angular/core';
import { DashboardService, HorasPorEmpresa } from '../dashboard.service';
import { Empresa, EmpresaService } from '../../empresa/empresa.service';
import { EChartsOption } from 'echarts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EchartsConfigModule } from '../../../echarts-config.module';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

interface ColaboradoresPorEmpresa {
  empresa: Empresa;
  colaboradoresAtivos: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, EchartsConfigModule, FormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule],
})
export class DashboardComponent implements OnInit {
  filtros = {
    dataInicio: '',
    dataFim: ''
  };

  selectedEmpresas: number[] = [];

  tipoGrafico: 'bar' | 'pie' | 'line' = 'bar';


  empresas: Empresa[] = [];

  horasEmpresaData: HorasPorEmpresa[] = [];
  horasEmpresaBarChartOptions: EChartsOption = {};
  carregandoHorasEmpresa = false;

  colaboradoresData: ColaboradoresPorEmpresa[] = [];
  colaboradoresBarChartOptions: EChartsOption = {};
  carregandoColaboradores = false;

  constructor(
    private dashboardService: DashboardService,
    private empresaService: EmpresaService
  ) { }

  async ngOnInit() {
    await this.loadEmpresas();
    await this.buscarDados();
  }

  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
    this.selectedEmpresas = this.empresas.map(empresa => empresa.id);
  }

  async buscarDados() {
    this.carregandoHorasEmpresa = true;
    this.carregandoColaboradores = true;

    try {
      // Buscar horas trabalhadas
      const todasHoras = await this.dashboardService.getHorasPorEmpresa(
        this.filtros.dataInicio,
        this.filtros.dataFim
      );
      let horasFiltradas = todasHoras;
      if (this.selectedEmpresas && this.selectedEmpresas.length > 0) {
        horasFiltradas = todasHoras.filter(h => this.selectedEmpresas.includes(h.empresa.id));
      }
      this.horasEmpresaData = horasFiltradas;
      this.montarGraficoHorasEmpresa(horasFiltradas);

      // Buscar colaboradores ativos
      const todosColaboradores = await this.dashboardService.getColaboradoresAtivosPorEmpresa(
        this.filtros.dataInicio,
        this.filtros.dataFim
      );
      let colaboradoresFiltrados = todosColaboradores;
      if (this.selectedEmpresas && this.selectedEmpresas.length > 0) {
        colaboradoresFiltrados = todosColaboradores.filter(c => this.selectedEmpresas.includes(c.empresa.id));
      }

      // Filtrar só quem tem > 0
      colaboradoresFiltrados = colaboradoresFiltrados.filter(c => c.colaboradoresAtivos > 0);
      this.colaboradoresData = colaboradoresFiltrados;
      this.montarGraficoColaboradores(colaboradoresFiltrados);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard', error);
    } finally {
      this.carregandoHorasEmpresa = false;
      this.carregandoColaboradores = false;
    }
  }

  montarGraficoHorasEmpresa(horas: HorasPorEmpresa[]) {
    const horasFiltradas = horas.filter(h => h.tempo !== '00:00:00');

    const empresas = horasFiltradas.map(h => h.empresa.nome);
    const horasTotais = horasFiltradas.map(h => this.tempoParaDecimal(h.tempo));
    const formatoHoras = horasFiltradas.map(h => h.tempo);

    if (this.tipoGrafico === 'pie') {
      this.horasEmpresaBarChartOptions = {
        title: {
          text: 'Horas Trabalhadas por Empresa (Relação)',
          left: 'center',
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} h ({d}%)'
        },
        series: [
          {
            name: 'Horas Trabalhadas',
            type: 'pie',
            radius: '50%',
            data: empresas.map((nome, i) => ({ name: nome, value: horasTotais[i] })),
            label: {
              formatter: '{b}: ({d}%)'  // Exibe nome, valor e %
            }
          }
        ]
      };
    } else if (this.tipoGrafico === 'line') {
      this.horasEmpresaBarChartOptions = {
        title: {
          text: 'Horas Trabalhadas por Empresa',
          left: 'center',
          textStyle: { fontSize: 16, fontWeight: 'bold' },
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: empresas,
          axisLabel: { interval: 0, rotate: 45, fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          name: 'Horas',
          axisLabel: { formatter: '{value} h' }
        },
        series: [
          {
            name: 'Horas Trabalhadas',
            type: 'line',
            smooth: true,
            data: horasTotais,
            label: {
              show: true,
              position: 'top',
              formatter: (params: any) => formatoHoras[params.dataIndex]
            },
            itemStyle: { color: '#3498db' }
          }
        ]
      };
    } else {
      // padrão barra
      this.horasEmpresaBarChartOptions = {
        title: {
          text: 'Horas Trabalhadas por Empresa',
          left: 'center',
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params: any) {
            const dataIndex = params[0].dataIndex;
            return `${empresas[dataIndex]}: ${formatoHoras[dataIndex]}`;
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: empresas,
          axisLabel: { interval: 0, rotate: 45, fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          name: 'Horas',
          axisLabel: { formatter: '{value} h' }
        },
        series: [
          {
            name: 'Horas Trabalhadas',
            type: 'bar',
            data: horasTotais,
            itemStyle: { color: '#3498db' },
            label: {
              show: true,
              position: 'top',
              formatter: function (params: any) {
                const dataIndex = params.dataIndex;
                return formatoHoras[dataIndex];
              }
            }
          }
        ]
      };
    }
  }

  montarGraficoColaboradores(colaboradores: ColaboradoresPorEmpresa[]) {
    if (!colaboradores.length) {
      this.colaboradoresBarChartOptions = {};
      return;
    }

    const empresas = colaboradores.map(c => c.empresa.nome);
    const colaboradoresAtivos = colaboradores.map(c => c.colaboradoresAtivos);

    if (this.tipoGrafico === 'pie') {
      // Para gráfico de pizza, os dados precisam ser [{value: number, name: string}]
      const pieData = colaboradores.map(c => ({
        value: c.colaboradoresAtivos,
        name: c.empresa.nome
      }));

      this.colaboradoresBarChartOptions = {
        title: {
          text: 'Colaboradores Ativos por Empresa (Relação)',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'  // Mostrar nome, valor e %
        },
        series: [
          {
            name: 'Colaboradores Ativos',
            type: 'pie',
            radius: '50%',
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: ({d}%)'  // Exibir nome, valor e %
            }
          }
        ]
      };
    } else {
      // Para 'bar' e 'line'
      this.colaboradoresBarChartOptions = {
        title: {
          text: 'Colaboradores Ativos por Empresa',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: empresas,
          axisLabel: {
            interval: 0,
            rotate: 45,
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          name: 'Colaboradores',
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: [
          {
            name: 'Colaboradores Ativos',
            type: this.tipoGrafico, // 'bar' ou 'line'
            data: colaboradoresAtivos,
            itemStyle: {
              color: '#2ecc71'
            },
            label: {
              show: true,
              position: 'top'
            }
          }
        ]
      };
    }
  }

  private tempoParaDecimal(tempo: string): number {
    const [h, m, s] = tempo.split(':').map(Number);
    return h + m / 60 + s / 3600;
  }

  onFiltroChange() {
    this.buscarDados();
  }
  limparFiltros() {
    this.filtros.dataInicio='';
    this.filtros.dataFim='';
    this.selectedEmpresas=[];
    this.onFiltroChange();
  }
}
