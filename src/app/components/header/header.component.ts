import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  time: string = '"';
  date: string = '"';
  private intervalo: any;

  ngOnInit() {
    this.updateTime();
    this.intervalo = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  private updateTime() {
    const now = new Date();
    this.time = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    this.date = now.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }
}
