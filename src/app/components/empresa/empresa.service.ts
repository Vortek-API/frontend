import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Colaborador, ColaboradorService } from '../colaborador/colaborador.service';
import { AuthService, UserLogado } from '../../services/auth/auth.service';

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
        private colaboradorService: ColaboradorService,
        private authService: AuthService
    ) { }

    async findAll(): Promise<Empresa[]> {
    let userLogado: UserLogado | undefined = await this.authService.getUserLogado();
    let emp: Promise<Empresa[]> = [] as unknown as Promise<Empresa[]>;

    if (userLogado?.grupo == "ADMIN") {
        emp = firstValueFrom(this.http.get<Empresa[]>(this.apiUrl));
    }
    if (userLogado?.grupo == "EMPRESA") {
        emp = firstValueFrom(this.http.get<Empresa[]>(`${this.apiUrl}/usuario/${userLogado?.id}`));
    }

    const empresas = await emp;

    if (empresas != null) {
        for (const empresa of empresas) {
            empresa.colaboradores = await this.findColabs(empresa.id);
        }
        empresas.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return empresas;
}

    async find(id: number): Promise<Empresa> {
        const emp = await firstValueFrom(this.http.get<Empresa>(`${this.apiUrl}/${id}`));
        emp.colaboradores = await this.findColabs(emp.id);

        return emp;
    }
    async findColabs(id: number): Promise<Colaborador[]> {
        const colabs = await firstValueFrom(this.http.get<Colaborador[]>(`${this.apiUrl}/colabs/${id}`));
        colabs.sort((a, b) => a.nome.localeCompare(b.nome));

        return colabs;
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
