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
import { provideNgxMask } from 'ngx-mask';

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
  searchTerm: string = '';
  selectedDate: string | null = null;
  ordenacao: string | null = null;

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
    // this.colaboradores.forEach(colaborador => {
    //   colaborador.hora_ent = colaborador.hora_ent.substring(0, 5);
    //   colaborador.hora_sai = colaborador.hora_sai.substring(0, 5);
    // });
  }
  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
  }

  clickRow(colaborador: Colaborador) {
    this.colaboradorService.setData(colaborador);
    this.abrirModalEditar();
  }
  get colaboradoesFiltrados(): Colaborador[] {
    let filtrados = this.colaboradores.filter(colaborador =>
      colaborador.nome.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    if(this.ordenacao == 'alfab') {
      filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    if(this.ordenacao == 'cadastro' && this.selectedDate){
      filtrados = filtrados.filter(colaborador => {
        const dataColaborador = colaborador.dataCadastro?.split('T')[0]; // pega só "2025-04-14"
        return dataColaborador === this.selectedDate;
      });
    }

    if(this.ordenacao == 'ativo' ){
      filtrados = filtrados.filter( colaborador => {
        return colaborador.status == true;
      })
    }

    if(this.ordenacao == 'inativo' ){
      filtrados = filtrados.filter( colaborador => {
        return colaborador.status == false;
      })
    }
    
    return filtrados;
  }

  handleOrdenacaoChange() {// Resetar data se saiu da ordenação por cadastro
    if (this.ordenacao !== 'cadastro') {
      this.selectedDate = null;
    }
  
    // Se limpou os filtros
    if (!this.ordenacao) {
      this.selectedDate = null;
      this.searchTerm = '';
    }
  }
}
