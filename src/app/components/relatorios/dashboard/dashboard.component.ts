import { Component, OnInit, inject } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { NgxEchartsModule } from 'ngx-echarts';
import { CommonModule } from '@angular/common';
import { EchartsConfigModule } from '../../../echarts-config.module';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, EchartsConfigModule ], // 👈 aqui

})
export class DashboardComponent implements OnInit {
  resumo: any;

  barChartOptions: any;
  pieChartOptions: any;
  lineChartOptions: any;
  radarChartOptions: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getResumoDashboard().subscribe({
      next: (data) => {
        this.resumo = data;
        // você pode adaptar os dados da API aqui para os gráficos
      },
      error: (err) => {
        console.error('Erro ao buscar resumo:', err);
      }
    });

    this.loadCharts();
  }

  loadCharts(): void {
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
          data: [10, 20, 15]
        }
      ]
    };

    this.pieChartOptions = {
      title: { text: 'Distribuição de Status', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: '50%',
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
          }
        }
      ]
    };

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
          data: [5, 15, 25, 20, 30]
        }
      ]
    };

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
