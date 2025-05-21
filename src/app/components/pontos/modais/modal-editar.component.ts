import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
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
  empresas?: string[];
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
    empresas: [],
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
  ) {}

  

  async ngOnInit() {
    await this.loadEmpresas();
    await this.loadColaboradores();  
    

    if (this.data) {
      this.registro = {
        ...this.data,
        cpf: '',
        nome: '',
        cargo: '',
        statusAtivo: true,
        empresas: []
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
      console.log(colaborador)

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

  async editarPontos() : Promise<void>{

    // Verificar e garantir que empresas é um array
    if (!this.colaborador.empresas || !Array.isArray(this.colaborador.empresas)) {
      // Se empresas não existe ou não é um array, inicialize como array vazio
      this.colaborador.empresas = [];
      console.warn('Propriedade empresas não é um array ou está undefined. Inicializando como array vazio.');
    }
    //empresas: Array.isArray(this.colaborador.empresas) ? [...this.colaborador.empresas] : [],

    let tempoTotalString: string = '00:00:00'; // Valor padrão caso haja algum problema

    const entradaMs = this.timeToMilliseconds(this.registro.horaEntrada);
    const saidaMs = this.timeToMilliseconds(this.registro.horaSaida);
    
    if (entradaMs !== 0 || saidaMs !== 0) {
    let diffMs = saidaMs - entradaMs;

    if (diffMs < 0) {
        diffMs += (24 * 60 * 60 * 1000); // Adiciona 24 horas em milissegundos
    }
        tempoTotalString = this.formatDuration(diffMs);
    } else {
        // Caso um dos horários não seja válido (ex: null, undefined, ou formato errado)
        console.warn('Não foi possível calcular o tempo total. Verifique os horários de entrada e saída do colaborador.');
    }

    const colaboradorEnviado: PontoDetalhado = {
      id: this.registro.id,
      colaboradorId: this.colaborador.id,
      empresaId: this.registro.empresaId,
      data: this.registro.data,
      horaEntrada: this.registro.horaEntrada|| '',
      horaSaida: this.registro.horaSaida || '',
      tempoTotal: tempoTotalString,
      justificativa: this.registro.justificativa
    };
      
    console.log(colaboradorEnviado)

    try {
      if (!colaboradorEnviado.id) {
        throw new Error('ID do colaborador é inválido');
      }
      await this.registroPontoService.update(colaboradorEnviado.id, colaboradorEnviado);
      await Swal.fire('Sucesso', 'Colaborador atualizado com sucesso.', 'success');
      this.close();
    } catch (error) {
      console.error(error);
      await Swal.fire('Erro', 'Erro ao atualizar o colaborador.', 'error');
    }
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

  // Função auxiliar:
  arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }


  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagemBase64 = e.target.result as string;  // A imagem será manipulada como string Base64
        this.imagemPreview = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removerImagem(): void {
    this.imagemBase64 = null;
    this.imagemPreview = new Uint8Array();
    this.colaborador.foto = '';  // Alterado para string vazia
  }

  removeBase64Prefix(base64: string): string {
    return base64.split(',')[1]; // Remove a parte `data:image/jpeg;base64,`
  }

  
}