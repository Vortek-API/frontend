import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      senha: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if(this.loginForm.invalid) return;

    this.errorMessage = null;
    const { login, senha } = this.loginForm.value;
    const cleanedLogin = login.replace(/\D/g, '');

  
    this.authService.login(cleanedLogin, senha).subscribe({
      next: (response) => {
       sessionStorage.setItem('userGroup', response.grupo);
       if(response.grupo === 'ADMIN') {
       this.router.navigate(['/home']);
       } else if(response.grupo === 'EMPRESA') {
         this.router.navigate(['/empresa']);}
      },
      error: (error) => {
        this.errorMessage = error.error || 'Erro ao fazer login. Verifique suas credenciais.';
      }
    });
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