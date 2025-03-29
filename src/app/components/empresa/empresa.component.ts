import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Empresa, EmpresaService } from './empresa.service';
import { ModalCadastroComponent } from "./modal-cadastro/modal-cadastro.component";

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ModalCadastroComponent],
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit {
  empresas: Empresa[] = [];

  constructor(
    private empresaService: EmpresaService
  ) {}

  async ngOnInit() {
    this.empresas = await this.empresaService.findAll();
  }
}