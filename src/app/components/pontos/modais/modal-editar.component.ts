import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatOptionModule } from "@angular/material/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { Empresa, EmpresaService } from "../../empresa/empresa.service";
import { Colaborador, ColaboradorService } from "../../colaborador/colaborador.service";

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


export class ModalEditarComponent {
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

    empresas: Empresa[] = [];

  imagemBase64: string | null = null;
  imagemPreview: string | Uint8Array = new Uint8Array();

  constructor(
    public dialogRef: MatDialogRef<ModalEditarComponent>,
    private colaboradorService: ColaboradorService,
    private empresaService: EmpresaService
  ) {}

  editarPontos(){
    console.log('chegou')
  }
}