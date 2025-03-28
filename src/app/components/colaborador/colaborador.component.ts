import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormularioColabComponent } from '../formulario-colab/formulario-colab.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-colaborador',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './colaborador.component.html',
  styleUrls:  ['./colaborador.component.css']
})
export class ColaboradorComponent {
  constructor(public dialog: MatDialog) { }

  abrirDialog(): void {
    const dialogRef = this.dialog.open(FormularioColabComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container'
    });

  }
}
