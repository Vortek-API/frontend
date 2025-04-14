import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Empresa, EmpresaService } from './empresa.service';
import { ModalCadastroComponent } from './modais/modal-cadastro/modal-cadastro.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalEditarDeletarComponent } from './modais/modal-editar-deletar/modal-editar-deletar.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit {
  empresas: Empresa[] = [];
  searchTerm: string = '';


  constructor(
    private empresaService: EmpresaService,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.loadEmpresas();
  }

  openModalCadastro() {
    this.dialog.open(ModalCadastroComponent, {
      width: '400px',
      height: '28%',
    });

    this.dialog.afterAllClosed.subscribe(() => {
      setTimeout(async () => {
        await this.loadEmpresas();
      }, 5000);

      setTimeout(async () => {
        await this.loadEmpresas();
      }, 30001);
    });
  }
  openModalEditar() {
    this.dialog.open(ModalEditarDeletarComponent, {
      width: '500px',
      height: '28%',
    });

    this.dialog.afterAllClosed.subscribe(() => {
      setTimeout(async () => {
        await this.loadEmpresas();
      }, 5000);

      setTimeout(async () => {
        await this.loadEmpresas();
      }, 30001);
    });
  }
  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
  }
  clickRow(empresa: Empresa) {
    this.empresaService.setData(empresa);
    this.openModalEditar();
  }
  get empresasFiltradas(): Empresa[] {
    return this.empresas.filter(empresa =>
      empresa.nome.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

}