import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-formulario-colab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './formulario-colab.component.html',
  styleUrl: './formulario-colab.component.css'
})
export class FormularioColabComponent {
  dados = {
    nome: '',
    cpf: '',
    cargo: '',
    empresa: '',
    entrada: '',
    saida: ''
  };

  constructor(public dialogRef: MatDialogRef<FormularioColabComponent>) {}

  onCancelar(): void {
    this.dialogRef.close();
  }

  onSalvar(): void {
    this.dialogRef.close(this.dados);
  }
}
