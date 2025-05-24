import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Empresa, EmpresaService } from '../../../empresa/empresa.service';
import { Colaborador, ColaboradorService } from '../../../colaborador/colaborador.service';
import { AuthService, UserLogado } from '../../../../services/auth/auth.service';
import { PontoDetalhado, RegistroPontoService } from '../../registro-ponto/registro-ponto.service';

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
    await this.loadColaboradores();
    await this.loadEmpresas();
  }

  async loadColaboradores() {
    this.colaboradores = await this.colaboradorService.findAll();
  }

  async loadEmpresas() {
    this.empresas = await this.empresaService.findAll();
    
    if (this.usuarioLogado && this.usuarioLogado.grupo === 'EMPRESA') {
      const empresasUsuario = this.usuarioLogado.empresas.map(e => e.id);
      this.empresas = this.empresas.filter(e => empresasUsuario.includes(e.id));
    }
  }

  async loadUserLogado() {
    this.usuarioLogado = await this.authService.getUserLogado();
  }

  get empresasFiltradas() {
    if (this.usuarioLogado && this.usuarioLogado.grupo === 'EMPRESA') {
      const empresasUsuario = this.usuarioLogado.empresas.map(e => e.id);
      return this.empresas.filter(e => empresasUsuario.includes(e.id));
    }
    return this.empresas;
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

  isHorarioValid(): boolean {
    if (!this.registroData.horaEntrada || !this.registroData.horaSaida) {
      return true; 
    }
    
    const entrada = this.registroData.horaEntrada;
    const saida = this.registroData.horaSaida;
    
    return entrada < saida;
  }

  onConfirmar() {
    // if (this.isFormValid() && this.isHorarioValid()) {
      this.pontoService.add(this.registroData);
      console.log(this.registroData);
      this.dialogRef.close(this.registroData);
    // }
  }

  onCancelar() {
    this.dialogRef.close();
  }
}