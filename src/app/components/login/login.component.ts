import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

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