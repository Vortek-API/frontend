import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Colaborador, ColaboradorService } from '../colaborador/colaborador.service';

export interface Empresa {
    id: number;
    nome: string;
    cnpj: string;
    dataCadastro?: string;
    colaboradores?: Colaborador[];
}

@Injectable({
    providedIn: 'root'
})
export class EmpresaService {

    private apiUrl = `${environment.apiUrl}/empresa`

    private empresaDataTransfer: Empresa | undefined;

    constructor(private http: HttpClient,
        private colaboradorService: ColaboradorService
    ) { }

    async findAll(): Promise<Empresa[]> {
        let emp: Promise<Empresa[]> = firstValueFrom(this.http.get<Empresa[]>(this.apiUrl));
        let colab: Promise<Colaborador[]> = this.colaboradorService.findAll();
    
        const empresas = await emp;
        const colaboradores = await colab;
    
        // empresas.forEach((empresa: Empresa) => {
        //     empresa.colaboradores = colaboradores.filter(c => c.empresa.id === empresa.id);
        //     const totalColaboradores = empresa.colaboradores.length;
        // });
    
        return empresas;
    }

    async find(id: number): Promise<Empresa> {
        return firstValueFrom(this.http.get<Empresa>(`${this.apiUrl}/${id}`));
    }

    async add(empresa: Empresa): Promise<Empresa> {
        return firstValueFrom(this.http.post<Empresa>(`${this.apiUrl}`, empresa));
    }

    async update(id: number, empresa: Empresa): Promise<Empresa> {
        return firstValueFrom(this.http.put<Empresa>(`${this.apiUrl}/${id}`, empresa));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    }
    setData(empresa: Empresa) {
        this.empresaDataTransfer = empresa;
    }

    getData(): any {
        const colabRet = this.empresaDataTransfer;
        this.empresaDataTransfer = undefined;

        return colabRet;
    }
}
