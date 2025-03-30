import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ModalCadastroComponent } from '../colaborador/modais/modal-cadastro/modal-cadastro.component';
import { MatButtonModule } from '@angular/material/button';
import { Colaborador, ColaboradorService } from './colaborador.service';
import { ModalEditarDeletarComponent } from '../colaborador/modais/modal-editar-deletar/modal-editar-deletar.component';


@Component({
  selector: 'app-colaborador',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './colaborador.component.html',
  styleUrls: ['./colaborador.component.css']
})
export class ColaboradorComponent implements OnInit {
  colaboradores: Colaborador[] = [];
  constructor(
    public dialog: MatDialog,
    private colaboradorService: ColaboradorService
  ) { }

  async ngOnInit() {
    await this.loadColaboradores();
  }

  async abrirModalCadastro() {
    this.dialog.open(ModalCadastroComponent, {
      width: '400px',
      height: '90%',
    });

    this.dialog.afterAllClosed.subscribe(() => {
      setTimeout(async () => {
        await this.loadColaboradores();
      }, 5000);

      setTimeout(async () => {
        await this.loadColaboradores();
      }, 30001);
    });
  }
  async abrirModalEditar() {
    this.dialog.open(ModalEditarDeletarComponent, {
      width: '400px',
      height: '90%',
    });

    this.dialog.afterAllClosed.subscribe(() => {
      setTimeout(async () => {
        await this.loadColaboradores();
      }, 5000);

      setTimeout(async () => {
        await this.loadColaboradores();
      }, 30000);
    });
  }
  async loadColaboradores() {
    this.colaboradores = await this.colaboradorService.findAll();
    this.colaboradores.forEach(colaborador => {
      colaborador.hora_ent = colaborador.hora_ent.substring(0, 5);
      colaborador.hora_sai = colaborador.hora_sai.substring(0, 5);
    });
  }
  clickRow(colaborador: Colaborador) {
    console.log('enviou')
    this.colaboradorService.setData(colaborador);
    this.abrirModalEditar();
  }
}
