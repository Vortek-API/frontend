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
    private empresasDataTransfer: Empresa[] = [];

    constructor(private http: HttpClient,
        private colaboradorService: ColaboradorService
    ) { }

    async findAll(): Promise<Empresa[]> {
        let emp: Promise<Empresa[]> = firstValueFrom(this.http.get<Empresa[]>(this.apiUrl));

        const empresas = await emp;

        if (empresas != null) {
            empresas.forEach(async (empresa: Empresa) => {
                empresa.colaboradores = await this.findColabs(empresa.id);
            });
        }

        return empresas;
    }

    async find(id: number): Promise<Empresa> {
        return firstValueFrom(this.http.get<Empresa>(`${this.apiUrl}/${id}`));
    }
    async findColabs(id: number): Promise<Colaborador[]> {
        return firstValueFrom(this.http.get<Colaborador[]>(`${this.apiUrl}/colabs/${id}`));
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
    setData(empresa: Empresa, empresas: Empresa[]) {
        this.empresaDataTransfer = empresa;
        this.empresasDataTransfer = empresas;
    }

    getData(): any {
        const empRet = this.empresaDataTransfer;
        const empsRet = this.empresasDataTransfer;
        this.empresaDataTransfer = undefined;

        return { empRet, empsRet };
    }
}
