import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { CommonModule } from '@angular/common';
import { EchartsConfigModule } from '../../../echarts-config.module';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, EchartsConfigModule, FormsModule],
})
export class DashboardComponent implements OnInit {
  // Dados do resumo
  resumo: any;
  
  // Configurações dos gráficos
  barChartOptions: any;
  pieChartOptions: any;
  lineChartOptions: any;
  radarChartOptions: any;
  
  // Gráficos para horas por empresa
  horasEmpresaBarChartOptions: any;
  horasEmpresaPieChartOptions: any;
  
  // Estado de carregamento
  carregando = false;
  carregandoHorasEmpresa = false;
  
  // Listas para os filtros
  listaEmpresas: string[] = [];
  listaStatus: string[] = [];

  showDownloadOptions: boolean = false;
  relatorioData: any[] = []; // Os dados do seu relatório (preenchidos após a filtragem)

  // Dados de horas por empresa
  horasEmpresaData: any[] = [];
  
  // Objeto de filtros
  filtros = {
    empresa: '',
    dataInicio: '',
    dataFim: '',
    status: '',
    categoria: '',
    ordenacao: ''
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  carregarDadosIniciais(): void {
    this.carregando = true;
    
    // Carregar lista de empresas para o filtro
    this.dashboardService.getEmpresas().subscribe({
      next: (empresas) => {
        this.listaEmpresas = empresas;
      },
      error: (err) => console.error('Erro ao carregar empresas:', err)
    });
    
    // Carregar lista de status para o filtro
    this.dashboardService.getStatus().subscribe({
      next: (status) => {
        this.listaStatus = status;
      },
      error: (err) => console.error('Erro ao carregar status:', err)
    });
    
    // Carregar dados do dashboard com filtros vazios inicialmente
    this.carregarDadosDashboard();
    
    // Carregar dados de horas por empresa
    this.carregarHorasPorEmpresa();
  }
  
  carregarDadosDashboard(): void {  
    this.carregando = true;
    
    this.dashboardService.getResumoDashboard(this.filtros).subscribe({
      next: (data) => {
        this.resumo = data;
        this.atualizarGraficos(data);
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao buscar resumo:', err);
        this.carregando = false;
      }
    });
  }
  
  carregarHorasPorEmpresa(): void {
    this.carregandoHorasEmpresa = true;
    
    this.dashboardService.getHorasPorEmpresa(this.filtros.dataInicio, this.filtros.dataFim).subscribe({
      next: (data) => {
        this.horasEmpresaData = data;
        this.atualizarGraficosHorasEmpresa(data);
        this.carregandoHorasEmpresa = false;
        // Também atualiza os dados para exportação se necessário
        this.prepararDadosParaExportacao(data);
      },
      error: (err) => {
        console.error('Erro ao buscar horas por empresa:', err);
        this.carregandoHorasEmpresa = false;
      }
    });
  }
  
  aplicarFiltros(): void {
    this.carregarDadosDashboard();
    this.carregarHorasPorEmpresa();
  }

  limparFiltros(): void {
    this.filtros = {
      empresa: '',
      dataInicio: '',
      dataFim: '',
      status: '',
      categoria: '',
      ordenacao: ''
    };
    
    this.carregarDadosDashboard();
    this.carregarHorasPorEmpresa();
  }

  prepararDadosParaExportacao(data: any[]): void {
    // Converte os dados de horas por empresa em um formato adequado para exportação
    this.relatorioData = data.map(item => ({
      empresaId: item.empresaId,
      empresaNome: item.empresaNome,
      horasTotais: item.horasTotais,
      minutosTotais: item.minutosTotais,
      segundosTotais: item.segundosTotais,
      tempoFormatado: `${item.horasTotais}h ${item.minutosTotais}m ${item.segundosTotais}s`
    }));
  }

  toggleDownloadOptions() {
    this.showDownloadOptions = !this.showDownloadOptions;
  }

  downloadCSV() {
    const csvData = this.convertToCSV(this.relatorioData);
    this.downloadFile(csvData, 'relatorio-horas-por-empresa.csv', 'text/csv');
    this.showDownloadOptions = false;
  }

  downloadPDF() {
    try {
      const pdf = new jsPDF();
      pdf.text('Relatório de Horas por Empresa', 10, 10);
  
      // Adicionar filtros aplicados
      if (this.filtros.dataInicio || this.filtros.dataFim) {
        let periodoTexto = 'Período: ';
        periodoTexto += this.filtros.dataInicio ? `De ${this.filtros.dataInicio}` : 'Sem data inicial';
        periodoTexto += this.filtros.dataFim ? ` até ${this.filtros.dataFim}` : ' até hoje';
        pdf.text(periodoTexto, 10, 20);
      }
  
      // Cabeçalho da tabela
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
      this.showDownloadOptions = false;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.showDownloadOptions = false;
      alert('Ocorreu um erro ao gerar o PDF.');
    }
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
  
  atualizarGraficosHorasEmpresa(data: any[]): void {
    if (!data || data.length === 0) {
      this.configurarGraficosHorasEmpresaVazios();
      return;
    }
    
    // Preparar dados para o gráfico de barras
    const empresas = data.map(item => item.empresaNome);
    const horasTotais = data.map(item => item.horasTotais + (item.minutosTotais / 60) + (item.segundosTotais / 3600));
    const formatoHoras = data.map(item => {
      const horas = item.horasTotais;
      const minutos = item.minutosTotais;
      const segundos = item.segundosTotais;
      
      return `${horas}h ${minutos}m ${segundos}s`;
    });
    
    // Configurar gráfico de barras
    this.horasEmpresaBarChartOptions = {
      title: { 
        text: 'Horas Trabalhadas por Empresa',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
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
        axisLabel: {
          interval: 0,
          rotate: 45,
          textStyle: {
            fontSize: 12
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Horas',
        axisLabel: {
          formatter: '{value} h'
        }
      },
      series: [
        {
          name: 'Horas Trabalhadas',
          type: 'bar',
          data: horasTotais,
          itemStyle: {
            color: '#3498db'
          },
          label: {
            show: true,
            position: 'top',
            formatter: function(params: any) {
              const dataIndex = params.dataIndex;
              return formatoHoras[dataIndex];
            }
          }
        }
      ]
    };
    
    // Configurar gráfico de pizza
    this.horasEmpresaPieChartOptions = {
      title: { 
        text: 'Distribuição de Horas por Empresa', 
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params: any) {
          const index = empresas.indexOf(params.name);
          if (index !== -1) {
            return `${params.name}: ${formatoHoras[index]} (${params.percent}%)`;
          }
          return params.name;
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        type: 'scroll',
        textStyle: {
          fontSize: 12
        }
      },
      series: [
        {
          name: 'Horas Trabalhadas',
          type: 'pie',
          radius: '60%',
          center: ['50%', '60%'],
          data: data.map((item, index) => ({
            name: item.empresaNome,
            value: horasTotais[index]
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}: {d}%'
          }
        }
      ]
    };
  }
  
  configurarGraficosHorasEmpresaVazios(): void {
    // Gráfico de barras vazio
    this.horasEmpresaBarChartOptions = {
      title: { 
        text: 'Horas Trabalhadas por Empresa',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value',
        name: 'Horas'
      },
      series: [
        {
          name: 'Horas Trabalhadas',
          type: 'bar',
          data: [],
          itemStyle: {
            color: '#3498db'
          }
        }
      ]
    };
    
    // Gráfico de pizza vazio
    this.horasEmpresaPieChartOptions = {
      title: { 
        text: 'Distribuição de Horas por Empresa', 
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: 'Horas Trabalhadas',
          type: 'pie',
          radius: '60%',
          center: ['50%', '60%'],
          data: [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }
  
  atualizarGraficos(data: any): void {
    // Implementação existente dos gráficos principais
    // Gráfico de barras - Colaboradores por Empresa
    if (data && data.colaboradoresPorEmpresa) {
      const empresas = data.colaboradoresPorEmpresa.map((item: any) => item.empresa);
      const valores = data.colaboradoresPorEmpresa.map((item: any) => item.quantidade);
      
      this.barChartOptions = {
        title: { text: 'Colaboradores por Empresa' },
        tooltip: {},
        xAxis: { data: empresas },
        yAxis: {},
        series: [{
          name: 'Colaboradores',
          type: 'bar',
          data: valores,
          itemStyle: {
            color: '#0C6834'
          }
        }]
      };
    } else {
      // Dados fictícios caso não venham da API
      this.barChartOptions = {
        title: { text: 'Colaboradores por Empresa' },
        tooltip: {},
        xAxis: {
          data: ['Empresa A', 'Empresa B', 'Empresa C']
        },
        yAxis: {},
        series: [
          {
            name: 'Colaboradores',
            type: 'bar',
            data: [10, 20, 15],
            itemStyle: {
              color: '#0C6834'
            }
          }
        ]
      };
    }
    
    // Gráfico de pizza - Distribuição de Status
    if (data && data.distribuicaoStatus) {
      const statusDados = data.distribuicaoStatus.map((item: any) => ({
        value: item.quantidade,
        name: item.status
      }));
      
      this.pieChartOptions = {
        title: { text: 'Distribuição de Status', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          {
            name: 'Status',
            type: 'pie',
            radius: '60%',
            center: ['50%', '50%'],
            data: statusDados,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: {c} ({d}%)'
            }
          }
        ]
      };
    } else {
      // Dados fictícios caso não venham da API
      this.pieChartOptions = {
        title: { text: 'Distribuição de Status', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          {
            name: 'Status',
            type: 'pie',
            radius: '60%',
            center: ['50%', '50%'],
            data: [
              { value: 30, name: 'Ativo' },
              { value: 15, name: 'Inativo' },
              { value: 10, name: 'Férias' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: {d}%'
            }
          }
        ]
      };
    }
                
    // Gráfico de linha - Histórico de registros
    if (data && data.historicoRegistros) {
      const datas = data.historicoRegistros.map((item: any) => item.data);
      const valores = data.historicoRegistros.map((item: any) => item.quantidade);
                
      this.lineChartOptions = {
        title: { text: 'Histórico de Registros' },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: datas
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: 'Registros',
          type: 'line',
          data: valores,
          itemStyle: {
            color: '#e67e22'
          },
          lineStyle: {
            width: 2
          }
        }]
      };
    }
                
    // Gráfico radar - Critérios de desempenho
    this.radarChartOptions = {
      title: { text: 'Indicadores de Desempenho' },
      tooltip: {},
      radar: {
        indicator: [
          { name: 'Pontualidade', max: 100 },
          { name: 'Horas Extras', max: 100 },
          { name: 'Ausências', max: 100 },
          { name: 'Pausas', max: 100 },
          { name: 'Inconsistências', max: 100 }
        ]
      },
      series: [
        {
          name: 'Desempenho',
          type: 'radar',
          data: [
            {
              value: [
                data?.indicePontualidade || 0,
                data?.taxaHorasExtras || 0,
                data?.frequenciaAusencias || 0,
                data?.tempoMedioPausas || 0,
                data?.taxaInconsistencias || 0
              ],
              name: 'Empresa'
            }
          ],
          itemStyle: {
            color: '#9b59b6'
          }
        }
      ]
    };
  }
}