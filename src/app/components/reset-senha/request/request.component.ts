import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-request',
  standalone: true,
  imports: [FormsModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './request.component.html',
  styleUrl: './request.component.css'
})
export class RequestComponent {
  login: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  requestReset(){
    this.isLoading = true;
    this.http.post('http://localhost:8080/api/reset-senha/request', null, { params: { login: this.login.trim() } })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Email de recuperação enviado! Verifique sua caixa de entrada e spam.', 'Fechar', {
            duration: 10000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['glass-snackbar']
          });
          this.login = '';
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.error , 'Fechar', {
            duration: 10000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['glass-snackbar', 'error-snackbar'] 
          });
          console.error('Erro na requisição:', err);
        }
      });
  }

}
