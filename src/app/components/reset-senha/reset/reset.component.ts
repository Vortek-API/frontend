import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

 
@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.css'
})
export class ResetComponent {
  token: string = '';
  novaSenha: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.snackBar.open('Token inválido ou ausente.', 'Fechar', {
        duration: 4000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['glass-snackbar', 'error-snackbar']
      });
    }
  }

  resetSenha() {
    this.http.post('http://localhost:8080/api/reset-senha/reset', null, {
      params: { token: this.token, novaSenha: this.novaSenha }
    }).subscribe({
      next: () => {
        this.snackBar.open('Senha redefinida com sucesso! Você pode fazer login agora.', 'Fechar', {
          duration: 10000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['glass-snackbar']
        });
        this.novaSenha = '';
      },
      error: (err) => {
        this.snackBar.open(err.error || 'Erro: Token inválido ou expirado.', 'Fechar', {
          duration: 10000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['glass-snackbar', 'error-snackbar']
        });
        console.error('Erro na redefinição:', err);
      }
    });
  }
}