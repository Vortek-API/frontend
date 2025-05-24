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
import { AuthService, UserLogado } from '../../services/auth/auth.service';
import{ ImagePipe } from '../../image.pipe';

@Component({
  selector: 'app-colaborador',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    ImagePipe
  ],
  templateUrl: './colaborador.component.html',
  styleUrls: ['./colaborador.component.css']
})
export class ColaboradorComponent implements OnInit {
  colaboradores: Colaborador[] = [];
  usuarioLogado: UserLogado | undefined;
  empresas: Empresa[] = [];
  selectedEmpresa: number | null = null;
  colaborador: any;
  searchTerm: string = '';
  selectedDate: string | null = null;
  ordenacao: string | null = null;

  itensPorPagina = 10;    // <- definido para controlar paginação
  paginaAtual = 1;

  constructor(
    public dialog: MatDialog,
    private colaboradorService: ColaboradorService,
    private empresaService: EmpresaService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    await this.loadUserLogado();
    await this.loadColaboradores();
    await this.loadEmpresas();
  }

  async abrirModalCadastro() {
    this.dialog.open(ModalCadastroComponent, {});

    this.dialog.afterAllClosed.subscribe(async () => {
      await this.loadColaboradores();
      // setTimeout(async () => {
      //   await this.loadColaboradores();
      // }, 2000);
    });
  }
  async abrirModalEditar() {
    this.dialog.open(ModalEditarDeletarComponent, {});
    this.dialog.afterAllClosed.subscribe(async () => {
      await this.loadColaboradores();
      // setTimeout(async () => {
      //   await this.loadColaboradores();
      // }, 2000);
    });
  }
  async loadColaboradores() {
    this.colaboradores = await this.colaboradorService.findAll();
  }
  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
  }
  async loadUserLogado() {
    this.usuarioLogado = await this.authService.getUserLogado();
  }

  clickRow(colaborador: Colaborador) {
    this.colaboradorService.setData(colaborador);
    this.abrirModalEditar();
  }

  get colaboradoesFiltrados(): Colaborador[] {
    if (!this.usuarioLogado) {
      return [];
    }

    let empresasDoUsuario: number[] = [];

    // ✅ Só define empresas se for EMPRESA
    if (this.usuarioLogado.grupo === 'EMPRESA') {
      empresasDoUsuario = this.usuarioLogado.empresas.map(e => e.id);
    }

    let filtrados = this.colaboradores.filter(colaborador => {
      const empresasColaborador = colaborador.empresas?.map(e => e.id) || [];

      // ✅ Se for ADMIN → não precisa verificar empresas
      const temEmpresaEmComum = this.usuarioLogado?.grupo === 'ADMIN' ||
        empresasColaborador.some(id => empresasDoUsuario.includes(id));

      return temEmpresaEmComum &&
        colaborador.nome.toLowerCase().includes(this.searchTerm.toLowerCase());
    });

    if (this.ordenacao === 'alfab') {
      filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    if (this.ordenacao === 'cadastro' && this.selectedDate) {
      filtrados = filtrados.filter(colaborador => {
        const dataColaborador = colaborador.dataCadastro?.split('T')[0];
        return dataColaborador === this.selectedDate;
      });
    }

    if (this.ordenacao === 'ativo') {
      filtrados = filtrados.filter(colaborador => colaborador.statusAtivo === true);
    }

    if (this.ordenacao === 'inativo') {
      filtrados = filtrados.filter(colaborador => colaborador.statusAtivo === false);
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

    formatarCPF(cpf?: string): string {
    if (!cpf) return '---';
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove não dígitos
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
