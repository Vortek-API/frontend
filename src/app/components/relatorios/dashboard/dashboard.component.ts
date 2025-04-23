import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { CommonModule } from '@angular/common';
import { EchartsConfigModule } from '../../../echarts-config.module';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';

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
  
  // Estado de carregamento
  carregando = false;
  
  // Listas para os filtros
  listaEmpresas: string[] = [];
  listaStatus: string[] = [];
  
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
        // Aqui poderia ter uma lógica para mostrar uma mensagem de erro
      }
    });
  }
  
  // Atualização do método aplicarFiltros no dashboard.component.ts
aplicarFiltros(): void {
  // Como removemos a caixa de pesquisa, não precisamos mais do delay
  this.carregarDadosDashboard();
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
}
  
  exportarRelatorio(): void {
    this.carregando = true;
    
    this.dashboardService.exportarRelatorio(this.filtros).subscribe({
      next: (blob) => {
        // Usando file-saver para fazer download do blob
        const dataAtual = new Date().toISOString().slice(0, 10);
        saveAs(blob, `relatorio-dashboard-${dataAtual}.xlsx`);
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao exportar relatório:', err);
        this.carregando = false;
        // Aqui poderia ter uma lógica para mostrar mensagem de erro
      }
    });
  }
  
  atualizarGraficos(data: any): void {
    // Estes são apenas exemplos. Na implementação real, 
    // você deve adaptar os dados vindo da API para os gráficos
    
    // Gráfico de barras - Colaboradores por Empresa
    if (data.colaboradoresPorEmpresa) {
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
    if (data.distribuicaoStatus) {
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
              { value: 40, name: 'Ativos' },
              { value: 30, name: 'Inativos' },
              { value: 30, name: 'Pendentes' }
            ],
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
    }
    
    // Gráfico de linha - Evolução Mensal
    if (data.evolucaoMensal) {
      const meses = data.evolucaoMensal.map((item: any) => item.mes);
      const valores = data.evolucaoMensal.map((item: any) => item.quantidade);
      
      this.lineChartOptions = {
        title: { text: 'Evolução Mensal' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: meses
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Colaboradores',
            type: 'line',
            data: valores,
            smooth: true,
            lineStyle: {
              color: '#0C6834',
              width: 3
            },
            itemStyle: {
              color: '#0C6834'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(12, 104, 52, 0.5)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(12, 104, 52, 0.05)'
                  }
                ]
              }
            }
          }
        ]
      };
    } else {
      // Dados fictícios caso não venham da API
      this.lineChartOptions = {
        title: { text: 'Evolução Mensal' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Colaboradores',
            type: 'line',
            data: [5, 15, 25, 20, 30],
            smooth: true,
            lineStyle: {
              color: '#0C6834',
              width: 3
            },
            itemStyle: {
              color: '#0C6834'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(12, 104, 52, 0.5)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(12, 104, 52, 0.05)'
                  }
                ]
              }
            }
          }
        ]
      };
    }
    
    // Gráfico de radar - Comparativo de Desempenho
    if (data.comparativoDesempenho) {
      const indicadores = data.comparativoDesempenho.indicadores;
      const empresas = data.comparativoDesempenho.empresas;
      
      this.radarChartOptions = {
        title: { text: 'Comparativo de Desempenho' },
        tooltip: {},
        legend: { data: empresas.map((emp: any) => emp.nome) },
        radar: {
          indicator: indicadores.map((ind: any) => ({ name: ind.nome, max: 100 }))
        },
        series: [
          {
            name: 'Desempenho',
            type: 'radar',
            data: empresas.map((emp: any) => ({
              value: emp.valores,
              name: emp.nome
            }))
          }
        ]
      };
    } else {
      // Dados fictícios caso não venham da API
      this.radarChartOptions = {
        title: { text: 'Comparativo de Desempenho' },
        tooltip: {},
        legend: { data: ['Empresa A', 'Empresa B'] },
        radar: {
          indicator: [
            { name: 'Produtividade', max: 100 },
            { name: 'Pontualidade', max: 100 },
            { name: 'Qualidade', max: 100 },
            { name: 'Satisfação', max: 100 }
          ]
        },
        series: [
          {
            name: 'Desempenho',
            type: 'radar',
            data: [
              {
                value: [80, 90, 70, 85],
                name: 'Empresa A'
              },
              {
                value: [70, 85, 80, 70],
                name: 'Empresa B'
              }
            ]
          }
        ]
      };
    }
  }
}