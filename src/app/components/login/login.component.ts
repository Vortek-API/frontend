import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;
    const { login, senha } = this.loginForm.value;
    // const cleanedLogin = login.replace(/\D/g, '');

    try {
      const response = await this.authService.login(login, senha);

      sessionStorage.setItem('userGroup', response.grupo);
      this.router.navigate(['/home']);

      this.snackBar.open('Bem-Vindo!', 'Fechar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['glass-snackbar']
      });
    } catch (error) {
      this.snackBar.open('Usuário ou Senha inválido.', 'Fechar', {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['glass-snackbar', 'error-snackbar']
      });
    }
  }

  formatEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = this.formatEmail(input.value);
  }

  private formatEmail(email: string): string {
    return email.trim().toLowerCase(); // remove espaços e deixa tudo minúsculo
  }

  formatCnpjInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = this.formatCnpj(input.value);
  }

  private formatCnpj(cnpj: string): string {
    const digits = cnpj.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 14);

    if (limitedDigits.length <= 2) return limitedDigits;
    if (limitedDigits.length <= 5) return `${limitedDigits.slice(0, 2)}.${limitedDigits.slice(2)}`;
    if (limitedDigits.length <= 8) return `${limitedDigits.slice(0, 2)}.${limitedDigits.slice(2, 5)}.${limitedDigits.slice(5)}`;
    if (limitedDigits.length <= 12) return `${limitedDigits.slice(0, 2)}.${limitedDigits.slice(2, 5)}.${limitedDigits.slice(5, 8)}/${limitedDigits.slice(8)}`;

    return `${limitedDigits.slice(0, 2)}.${limitedDigits.slice(2, 5)}.${limitedDigits.slice(5, 8)}/${limitedDigits.slice(8, 12)}-${limitedDigits.slice(12)}`;
  }
}