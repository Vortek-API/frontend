import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { MatOptionModule } from "@angular/material/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { Empresa, EmpresaService } from "../../empresa/empresa.service";
import { Colaborador, ColaboradorService } from "../../colaborador/colaborador.service";
import { PontoDetalhado, RegistroPontoService } from '../registro-ponto/registro-ponto.service';
import Swal from 'sweetalert2';

interface PontoDetalhadoComColaborador extends PontoDetalhado {
  cpf?: string;
  nome?: string;
  cargo?: string;
  statusAtivo?: boolean;
  empresas?: Empresa[];
}


@Component({
  selector: 'app-modal-editar',
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './modal-editar.component.html',
  styleUrls: ['./modal-editar.component.css']
})


export class ModalEditarComponent implements OnInit {
  colaborador: Colaborador = {
    id: 0,
    cpf: '',
    nome: '',
    cargo: '',
    empresas: [],
    horarioEntrada: '',
    horarioSaida: '',
    statusAtivo: true,
    foto: new Uint8Array()
  };

  registro: PontoDetalhadoComColaborador = {
    id: 0,
    colaboradorId: 0,
    empresaId: 0,
    data: '',
    tempoTotal: '',
    horaEntrada: '',
    horaSaida: '',
    cpf: '',
    nome: '',
    cargo: '',
    statusAtivo: true,
    justificativa: ''
  };

  colaboradores: Colaborador[] = [];
  empresas: Empresa[] = [];

  imagemBase64: string | null = null;
  imagemPreview: string | Uint8Array = new Uint8Array();


  constructor(
    public dialogRef: MatDialogRef<ModalEditarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PontoDetalhado,
    private colaboradorService: ColaboradorService,
    private empresaService: EmpresaService,
    private registroPontoService: RegistroPontoService
  ) { }



  async ngOnInit() {
    await this.loadColaboradores();
    await this.loadEmpresas();

    if (this.data) {
      this.registro = {
        ...this.data,
        cpf: '',
        nome: '',
        cargo: '',
        statusAtivo: true
      };

      const colaborador = this.colaboradores.find(c => c.id === this.registro.colaboradorId);

      if (colaborador) {
        this.registro.cpf = colaborador.cpf;
        this.registro.nome = colaborador.nome;
        this.registro.cargo = colaborador.cargo;
        this.registro.statusAtivo = colaborador.statusAtivo;
        this.loadEditData()
      }

    }
  }

  async loadColaboradores() {
    try {
      this.colaboradores = await this.colaboradorService.findAll();
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
      this.colaboradores = [];
    }
  }

  async loadEmpresas() {
    try {
      this.empresas = await this.empresaService.findAll();
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      this.empresas = [];
    }
  }


  close(): void {
    this.dialogRef.close();
  }

  loadEditData(): void {
    if (!this.data || !this.data.colaboradorId) return;

    const colaboradorId = this.data.colaboradorId;
    const colaborador = this.colaboradores.find(c => c.id === colaboradorId);

    if (colaborador) {

      const empresasArray = Array.isArray(colaborador.empresas) ? colaborador.empresas : [];

      this.colaborador = {
        id: colaborador.id || 0,
        cpf: colaborador.cpf || '',
        nome: colaborador.nome || '',
        cargo: colaborador.cargo || '',
        horarioEntrada: colaborador.horarioEntrada || '',
        horarioSaida: colaborador.horarioSaida || '',
        statusAtivo: colaborador.statusAtivo === undefined ? true : colaborador.statusAtivo,
        foto: colaborador.foto || new Uint8Array(),
        empresas: empresasArray.map(empColab => {
          const empresa = this.empresas.find(e => e.id === (empColab?.id || 0));
          return empresa || empColab;
        })
      };

      if (this.colaborador.foto && this.colaborador.foto.length > 0) {
        if (typeof this.colaborador.foto !== 'string') {
          // Se for Uint8Array, converte para Base64
          const binary = this.arrayBufferToBase64(this.colaborador.foto);
          this.imagemPreview = `data:image/jpeg;base64,${binary}`;
        } else {
          this.imagemPreview = `data:image/jpeg;base64,${this.colaborador.foto}`;
        }
      }

    }
  }

  async editarPontos(form: NgForm) {
    if (form.valid) {
      try {
        // Trata os horários negativos antes de enviar
        this.registro.horaEntrada = this.tratarHorarioNegativo(this.registro.horaEntrada);
        this.registro.horaSaida = this.tratarHorarioNegativo(this.registro.horaSaida);

        console.log(this.registro);

        await this.registroPontoService.update(this.registro.id!, this.registro);
        await Swal.fire({
          icon: 'success',
          title: 'Registro atualizado com sucesso!',
          confirmButtonColor: '#3085d6',
        });
        this.dialogRef.close();
      } catch (error) {
        console.error('Erro ao atualizar registro:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao atualizar registro',
          text: 'Tente novamente mais tarde.',
          confirmButtonColor: '#d33',
        });
      }
    }
  }

  private tratarHorarioNegativo(horario: string): string {
    if (horario && horario.startsWith('-')) {
      return horario.substring(1); // Remove o sinal de negativo
    }
    return horario;
  }

  private timeToMilliseconds(timeStr: string): number {
    if (!timeStr) {
      return 0;
    }
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const hours = parts[0];
      const minutes = parts[1];
      const seconds = parts[2];
      return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }
    return 0; // Retorna 0 para horários inválidos
  }

  private formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Adiciona zero à esquerda se o número for menor que 10
    const pad = (num: number) => num < 10 ? '0' + num : '' + num;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }


  arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }


}