import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  resumo: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getResumoDashboard().subscribe({
      next: (data) => {
        this.resumo = data;
      },
      error: (err) => {
        console.error('Erro ao buscar resumo:', err);
      }
    });
  }
}

