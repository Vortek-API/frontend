import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UserLogado } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  userLogado: UserLogado | undefined;
  async ngOnInit(): Promise<void> {
    this.userLogado = await this.authService.getUserLogado();
  }
  
  logout() {
    sessionStorage.removeItem('userGroup'); 
    this.router.navigate(['/login']); 
  }
}
