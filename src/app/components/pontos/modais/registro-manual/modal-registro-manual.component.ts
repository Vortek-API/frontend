import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Empresa, EmpresaService } from '../../../empresa/empresa.service';
import { Colaborador, ColaboradorService } from '../../../colaborador/colaborador.service';
import { AuthService, UserLogado } from '../../../../services/auth/auth.service';
import { PontoDetalhado, RegistroPontoService } from '../../registro-ponto/registro-ponto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-registro-manual',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-registro-manual.component.html',
  styleUrls: ['./modal-registro-manual.component.css']
})
export class ModalRegistroManualComponent implements OnInit {
  colaboradores: Colaborador[] = [];
  empresas: Empresa[] = [];
  usuarioLogado: UserLogado | undefined;
  colaboradorSelecionado: Colaborador | undefined;
  empresaSelecionada: Empresa | undefined;

  registroData: PontoDetalhado = {
    colaboradorId: 0,
    empresaId: 0,
    data: '',
    horaEntrada: '',
    horaSaida: '',
    justificativa: ''
  };

  constructor(
    public dialogRef: MatDialogRef<ModalRegistroManualComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private empresaService: EmpresaService,
    private colaboradorService: ColaboradorService,
    private authService: AuthService,
    private pontoService: RegistroPontoService
  ) {
    const hoje = new Date();
    this.registroData.data = hoje.toISOString().split('T')[0];
  }

  async ngOnInit() {
    await this.loadUserLogado();
    await this.loadEmpresas();
    await this.loadColaboradores();
  }

  async loadColaboradores() {
    const colaboradoresDuplicados = this.empresas.flatMap(e => e.colaboradores ?? []);

    const mapaColaboradores = new Map<number, Colaborador>();
    colaboradoresDuplicados.forEach(colab => {
      mapaColaboradores.set(colab.id, colab);
    });

    this.colaboradores = Array.from(mapaColaboradores.values());

    this.colaboradores.sort((a, b) => a.nome.localeCompare(b.nome));
  }


  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
  }

  async loadUserLogado() {
    this.usuarioLogado = await this.authService.getUserLogado();
  }

  get empresasFiltradas(): Empresa[] {
    if (!this.empresas || this.empresas.length === 0) {
      return [];
    }

    if (this.colaboradorSelecionado && this.colaboradorSelecionado.empresas) {
      const empresasColabIds = this.colaboradorSelecionado.empresas.map(e => e.id);

      if (this.usuarioLogado?.grupo === 'EMPRESA') {
        const empresasUsuarioIds = this.usuarioLogado.empresas.map(e => e.id);

        return this.empresas.filter(e =>
          empresasColabIds.includes(e.id) && empresasUsuarioIds.includes(e.id)
        );
      }
      else if (this.usuarioLogado?.grupo === 'ADMIN') {
        return this.empresas.filter(e => empresasColabIds.includes(e.id));
      }
      return this.empresas.filter(e => empresasColabIds.includes(e.id));
    }

    if (this.usuarioLogado?.grupo === 'EMPRESA') {
      const empresasUsuario = this.usuarioLogado.empresas.map(e => e.id);
      return this.empresas.filter(e => empresasUsuario.includes(e.id));
    }
    else if (this.usuarioLogado?.grupo === 'ADMIN') {
      return [...this.empresas];
    }

    return [];
  }

  get colaboradoresFiltrados(): Colaborador[] {
    if (this.empresaSelecionada) {
      return this.empresaSelecionada.colaboradores ? this.empresaSelecionada.colaboradores : this.colaboradores;
    }

    return this.colaboradores;
  }


  async onConfirmar() {
    try {
      await this.pontoService.add(this.registroData);
      
      // Exibe o pop-up de sucesso
      await Swal.fire({
        icon: 'success',
        title: 'Registro salvo com sucesso!',
        confirmButtonColor: '#3085d6',
      });

      this.dialogRef.close(this.registroData);
    } catch (error) {
      // Opcional: tratar erros com outro pop-up
      console.error('Erro ao salvar registro:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao salvar registro',
        text: 'Tente novamente mais tarde.',
        confirmButtonColor: '#d33',
      });
    }
  }

  onCancelar() {
    this.dialogRef.close();
  }

  isFormValid(): boolean {
    return !!(
      this.registroData.colaboradorId &&
      this.registroData.empresaId &&
      this.registroData.data &&
      this.registroData.horaEntrada &&
      this.registroData.horaSaida &&
      this.registroData.justificativa.trim()
    );
  }

  async onColaboradorChange() {
    if (this.registroData.colaboradorId > 0) {
      this.colaboradorSelecionado = await this.colaboradorService.find(this.registroData.colaboradorId);
    } else {
      this.colaboradorSelecionado = undefined;
    }
  }

  async onEmpresaChange() {
    
    if (this.registroData.empresaId > 0) {
      this.empresaSelecionada = await this.empresaService.find(this.registroData.empresaId);
    }
    else this.empresaSelecionada = undefined;
  }

}