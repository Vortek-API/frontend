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
  styleUrls: ['./colaborador.component.css']
})
export class ColaboradorComponent {
  constructor(public dialog: MatDialog) { }

  abrirDialog(): void {
    const dialogRef = this.dialog.open(FormularioColabComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container'
    });
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Ativo': return 'status-active';
      case 'Inativo': return 'status-inactive';
      case 'Atrasado': return 'status-late';
      default: return '';
    }
  }

  employees = [
    { cpf: '123456789', name: 'João Silva', position: 'Analista de Sistemas', company: 'Tech Solutions', date: '01 Janeiro 2025', status: 'Ativo', entry: '08:00', exit: '17:00', hoursWorked: '9h' },
    { cpf: '987654321', name: 'Maria Oliveira', position: 'Desenvolvedora Frontend', company: 'WebDev Inc.', date: '12 Fevereiro 2024', status: 'Inativo', entry: '09:00', exit: '18:00', hoursWorked: '0h' },
    { cpf: '112233445', name: 'Carlos Pereira', position: 'Gerente de Projetos', company: 'Global Tech', date: '23 Março 2023', status: 'Atrasado', entry: '10:30', exit: '19:00', hoursWorked: '8h 30m' },
    { cpf: '223344556', name: 'Ana Costa', position: 'Designer Gráfico', company: 'Creative Studio', date: '05 Julho 2022', status: 'Ativo', entry: '08:30', exit: '17:30', hoursWorked: '9h' },
    { cpf: '334455667', name: 'Felipe Souza', position: 'DevOps', company: 'Cloud Services', date: '10 Setembro 2023', status: 'Ativo', entry: '08:00', exit: '17:00', hoursWorked: '9h' },
    { cpf: '445566778', name: 'Carla Lima', position: 'Analista de Qualidade', company: 'Tech Solutions', date: '15 Outubro 2024', status: 'Atrasado', entry: '11:00', exit: '20:00', hoursWorked: '9h' }
  ];
}
