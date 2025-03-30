import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ModalCadastroComponent } from '../colaborador/modais/modal-cadastro/modal-cadastro.component';
import { MatButtonModule } from '@angular/material/button';
import { Colaborador, ColaboradorService } from './colaborador.service';
import { ModalEditarDeletarComponent } from '../colaborador/modais/modal-editar-deletar/modal-editar-deletar.component';
import { Empresa, EmpresaService } from '../empresa/empresa.service';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-colaborador',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './colaborador.component.html',
  styleUrls: ['./colaborador.component.css']
})
export class ColaboradorComponent implements OnInit {
  colaboradores: Colaborador[] = [];
  empresas: Empresa[] = [];
  selectedEmpresa: number | null = null;
colaborador: any;

  constructor(
    public dialog: MatDialog,
    private colaboradorService: ColaboradorService,
    private empresaService: EmpresaService,
  ) { }

  async ngOnInit() {
    await this.loadColaboradores();
    await this.loadEmpresas();
  }

  async abrirModalCadastro() {
    console.log(this.selectedEmpresa);
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
  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
  }

  clickRow(colaborador: Colaborador) {
    console.log('enviou')
    this.colaboradorService.setData(colaborador);
    this.abrirModalEditar();
  }
}
