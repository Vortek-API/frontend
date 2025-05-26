import { Component, OnInit } from '@angular/core';
import { AtrasadosPorEmpresa, DashboardService, HorasPorEmpresa } from '../dashboard.service';
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

  mostrarModal = false;

abrirModal() {
  this.mostrarModal = true;
}

fecharModal() {
  this.mostrarModal = false;
}

confirmarModal() {
  this.mostrarModal = false;
  this.onFiltroChange();
}

selecionarTodasEmpresas() {
  this.selectedEmpresas = this.empresas.map(empresa => empresa.id);
  this.onFiltroChange();
}

desmarcarTodasEmpresas() {
  this.selectedEmpresas = [];
  this.onFiltroChange();
}



  selectedEmpresas: number[] = [];

  tipoGrafico: 'bar' | 'pie' | 'line' = 'bar';


  empresas: Empresa[] = [];

  horasEmpresaData: HorasPorEmpresa[] = [];
  horasEmpresaBarChartOptions: EChartsOption = {};
  carregandoHorasEmpresa = false;

  colaboradoresData: ColaboradoresPorEmpresa[] = [];
  colaboradoresInativosData: ColaboradoresPorEmpresa[] = [];
  colaboradoresAtrasadosData: AtrasadosPorEmpresa[] = [];
  colaboradoresSaidaAdiantadaData: AtrasadosPorEmpresa[] = [];
  colaboradoresBarChartOptions: EChartsOption = {};
  colaboradoresInativosBarChartOptions: EChartsOption = {};
  colaboradoresAtrasadosBarChartOptions: EChartsOption = {};
  colaboradoresSaidaAdiantadaBarChartOptions: EChartsOption = {};
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

      // Buscar colaboradores Inativos
      const todosColaboradoresInativos = await this.dashboardService.getColaboradoresInativosPorEmpresa(
        this.filtros.dataInicio,
        this.filtros.dataFim
      );
      let colaboradoresInativosFiltrados = todosColaboradoresInativos;
      if (this.selectedEmpresas && this.selectedEmpresas.length > 0) {
        colaboradoresInativosFiltrados = todosColaboradoresInativos.filter(c => this.selectedEmpresas.includes(c.empresa.id));
      }

      // Filtrar só quem tem > 0
      colaboradoresInativosFiltrados = colaboradoresInativosFiltrados.filter(c => c.colaboradoresAtivos > 0);
      this.colaboradoresInativosData = colaboradoresInativosFiltrados;
      this.montarGraficoColaboradoresInativos(colaboradoresInativosFiltrados);

      // Buscar colaboradores Atrasados
      const todosColaboradoresAtrasados = await this.dashboardService.getAtrasadosPorEmpresa(
        this.filtros.dataInicio,
        this.filtros.dataFim
      );
      let colaboradoresAtrasadosFiltrados = todosColaboradoresAtrasados;
      if (this.selectedEmpresas && this.selectedEmpresas.length > 0) {
        colaboradoresAtrasadosFiltrados = todosColaboradoresAtrasados.filter(c => this.selectedEmpresas.includes(c.empresa.id));
      }

      // Filtrar só quem tem > 0
      colaboradoresAtrasadosFiltrados = colaboradoresAtrasadosFiltrados.filter(c => c.colaboradoresAtrasados > 0);
      this.colaboradoresAtrasadosData = colaboradoresAtrasadosFiltrados;
      this.montarGraficoColaboradoresAtrasados(colaboradoresAtrasadosFiltrados);

      // Buscar colaboradores saindo antes
      const todosColaboradoresSaidaAdiantada = await this.dashboardService.getSaidaAdiantadaPorEmpresa(
        this.filtros.dataInicio,
        this.filtros.dataFim
      );
      let colaboradoresSaidaAdiantadaFiltrados = todosColaboradoresSaidaAdiantada;
      if (this.selectedEmpresas && this.selectedEmpresas.length > 0) {
        colaboradoresSaidaAdiantadaFiltrados = todosColaboradoresSaidaAdiantada.filter(c => this.selectedEmpresas.includes(c.empresa.id));
      }

      // Filtrar só quem tem > 0
      colaboradoresSaidaAdiantadaFiltrados = colaboradoresSaidaAdiantadaFiltrados.filter(c => c.colaboradoresAtrasados > 0);
      this.colaboradoresSaidaAdiantadaData = colaboradoresSaidaAdiantadaFiltrados;
      this.montarGraficoColaboradoresSaidaAdiantada(colaboradoresSaidaAdiantadaFiltrados);
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
          left: 'left',
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
          left: 'left',
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
  montarGraficoColaboradoresInativos(colaboradores: ColaboradoresPorEmpresa[]) {
    if (!colaboradores.length) {
      this.colaboradoresInativosBarChartOptions = {};
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

      this.colaboradoresInativosBarChartOptions = {
        title: {
          text: 'Colaboradores Inativos por Empresa (Relação)',
          left: 'left',
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
            name: 'Colaboradores Inativos',
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
      this.colaboradoresInativosBarChartOptions = {
        title: {
          text: 'Colaboradores Inativos por Empresa',
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
            name: 'Colaboradores Inativos',
            type: this.tipoGrafico, // 'bar' ou 'line'
            data: colaboradoresAtivos,
            itemStyle: {
              color: '#7a1818'
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
  montarGraficoColaboradoresAtrasados(colaboradores: AtrasadosPorEmpresa[]) {
    if (!colaboradores.length) {
      this.colaboradoresAtrasadosBarChartOptions = {};
      return;
    }

    const empresas = colaboradores.map(c => c.empresa.nome);
    const colaboradoresAtrasados = colaboradores.map(c => c.colaboradoresAtrasados);

    if (this.tipoGrafico === 'pie') {
      // Para gráfico de pizza, os dados precisam ser [{value: number, name: string}]
      const pieData = colaboradores.map(c => ({
        value: c.colaboradoresAtrasados,
        name: c.empresa.nome
      }));

      this.colaboradoresAtrasadosBarChartOptions = {
        title: {
          text: 'Entrada Atrasada de Colaboradores por Empresa (Relação)',
          left: 'left',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ({d}%)'  // Mostrar nome, valor e %
        },
        series: [
          {
            name: 'Colaboradores Atrasados',
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
      this.colaboradoresAtrasadosBarChartOptions = {
        title: {
          text: 'Entrada Atrasada de Colaboradores por Empresa',
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
            name: 'Colaboradores Atrasados',
            type: this.tipoGrafico, // 'bar' ou 'line'
            data: colaboradoresAtrasados,
            itemStyle: {
              color: '#d15c21'
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
  montarGraficoColaboradoresSaidaAdiantada(colaboradores: AtrasadosPorEmpresa[]) {
    if (!colaboradores.length) {
      this.colaboradoresSaidaAdiantadaBarChartOptions = {};
      return;
    }

    const empresas = colaboradores.map(c => c.empresa.nome);
    const colaboradoresSaidaAdiantada = colaboradores.map(c => c.colaboradoresAtrasados);

    if (this.tipoGrafico === 'pie') {
      // Para gráfico de pizza, os dados precisam ser [{value: number, name: string}]
      const pieData = colaboradores.map(c => ({
        value: c.colaboradoresAtrasados,
        name: c.empresa.nome
      }));

      this.colaboradoresSaidaAdiantadaBarChartOptions = {
        title: {
          text: 'Saída Adiantada de Colaboradores por Empresa (Relação)',
          left: 'left',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ({d}%)'  // Mostrar nome, valor e %
        },
        series: [
          {
            name: 'Colaboradores Adiantados',
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
      this.colaboradoresSaidaAdiantadaBarChartOptions = {
        title: {
          text: 'Saída Adiantada de Colaboradores por Empresa',
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
            name: 'Colaboradores Adiantados',
            type: this.tipoGrafico, // 'bar' ou 'line'
            data: colaboradoresSaidaAdiantada,
            itemStyle: {
              color: '#9e4e26'
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
    this.filtros.dataInicio = '';
    this.filtros.dataFim = '';
    this.selectedEmpresas = [];
    this.onFiltroChange();
  }
  onTipoGraficoChange() {
    this.montarGraficoHorasEmpresa(this.horasEmpresaData);
    this.montarGraficoColaboradores(this.colaboradoresData);
    this.montarGraficoColaboradoresInativos(this.colaboradoresInativosData);
    this.montarGraficoColaboradoresAtrasados(this.colaboradoresAtrasadosData);
    this.montarGraficoColaboradoresSaidaAdiantada(this.colaboradoresSaidaAdiantadaData);
  }
}
