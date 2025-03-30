import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ModalCadastroComponent } from '../colaborador/modais/modal-cadastro/modal-cadastro.component';
import { ModalEditarDeletarComponent } from '../colaborador/modais/modal-editar-deletar/modal-editar-deletar.component';
import { MatButtonModule } from '@angular/material/button';
import { Colaborador, ColaboradorService } from './colaborador.service';


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

  abrirModalCadastro() {
    this.dialog.open(ModalCadastroComponent, {
      width: '400px',
      height: '90%',
    });
  }
  async loadColaboradores() {
    this.colaboradores = await this.colaboradorService.findAll();
  }
  clickRow(colaborador: Colaborador){
    console.log('enviou')
    this.colaboradorService.setData(colaborador);
    this.abrirModalCadastro();
  }
}
