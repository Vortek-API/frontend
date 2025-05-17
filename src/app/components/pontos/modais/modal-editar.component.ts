import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatOptionModule } from "@angular/material/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { Empresa, EmpresaService } from "../../empresa/empresa.service";
import { Colaborador, ColaboradorService } from "../../colaborador/colaborador.service";
import { PontoDetalhado } from '../registro-ponto/registro-ponto.service';
import Swal from 'sweetalert2';

interface PontoDetalhadoComColaborador extends PontoDetalhado {
  cpf?: string;
  nome?: string;
  cargo?: string;
  statusAtivo?: boolean;
  empresas?: string;
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
    empresas: ''
  };

  //registro!: PontoDetalhadoComColaborador;
  colaboradores: Colaborador[] = [];
  empresas: Empresa[] = [];
  

  imagemBase64: string | null = null;
  imagemPreview: string | Uint8Array = new Uint8Array();

  constructor(
    public dialogRef: MatDialogRef<ModalEditarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PontoDetalhado,
    private colaboradorService: ColaboradorService,
    private empresaService: EmpresaService
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
        empresas: ''
      };
    
    const colaborador = this.colaboradores.find(c => c.id === this.registro.colaboradorId);
    
    if (colaborador) {
      this.registro.cpf = colaborador.cpf; 
      this.registro.nome = colaborador.nome;
      this.registro.cargo = colaborador.cargo;
      this.registro.statusAtivo = colaborador.statusAtivo;
      this.registro.empresas = this.getNomeEmpresa(this.registro.empresaId)
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

  getNomeEmpresa(id: number) {
    return this.empresas.find(e => e.id === id)?.nome || '---';
  }

loadEditData(): void {
  const colaboradorId = this.data.colaboradorId;
  const colaborador = this.colaboradores.find(c => c.id === colaboradorId);

  if (colaborador) {
    this.colaborador = {
      ...colaborador,
      empresas: colaborador.empresas?.map(empColab => {
        return this.empresas.find(e => e.id === empColab.id) || empColab;
      }) || []  // Garante que empresas seja sempre um array
    };

    if (this.colaborador.foto) {
        if (typeof this.colaborador.foto !== 'string') {
          // Se for Uint8Array, converte para Base64
          const binary = this.arrayBufferToBase64(this.colaborador.foto);
          this.imagemPreview = `data:image/jpeg;base64,${binary}`;
        } else {
          this.imagemPreview = `data:image/jpeg;base64,${this.colaborador.foto}`;
        }
      }

    // Verificação para garantir que 'empresas' foi preenchido corretamente
    console.log('Colaborador após loadcolaborador', this.colaborador);
  }
}

  async editarPontos() : Promise<void>{
    
    const colaboradorEnviado: Colaborador = {
      ...this.colaborador,
      empresas: this.colaborador.empresas ? [...this.colaborador.empresas] : [],
      foto: this.imagemBase64 ? this.removeBase64Prefix(this.imagemBase64) : this.colaborador.foto
    };
    console.log(this.colaborador.empresas)
    try {
      await this.colaboradorService.update(colaboradorEnviado.id, colaboradorEnviado);
      await Swal.fire('Sucesso', 'Colaborador atualizado com sucesso.', 'success');
      this.close();
    } catch (error) {
      console.error(error);
      await Swal.fire('Erro', 'Erro ao atualizar o colaborador.', 'error');
    }
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