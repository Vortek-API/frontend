import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Colaborador {
    id: number;
    cpf: string;
    nome: string;
    cargo: string;
    hora_ent: string;
    hora_sai: string;
    status: boolean;
    dataCadastro?: string;
    empresas: {
        id: number;
        nome: string;
        cnpj: string;
    }[];  // Atributo empresas (array)
}

@Injectable({
    providedIn: 'root',
})
export class ColaboradorService {

    private apiUrl = `${environment.apiUrl}/colaborador`;
    private colaboradorDataTransfer: Colaborador | undefined;

    constructor(private http: HttpClient) {}

    async findAll(): Promise<Colaborador[]> {
        return firstValueFrom(this.http.get<Colaborador[]>(this.apiUrl));
    }

    async find(id: number): Promise<Colaborador> {
        return firstValueFrom(this.http.get<Colaborador>(`${this.apiUrl}/${id}`));
    }

    async add(colaborador: Colaborador): Promise<Colaborador> {
        return firstValueFrom(this.http.post<Colaborador>(this.apiUrl, colaborador, {
            headers: {
                'Content-Type': 'application/json'
            }
        }));
    }

    async update(id: number, colaborador: Colaborador): Promise<Colaborador> {
        return firstValueFrom(this.http.put<Colaborador>(`${this.apiUrl}/${id}`, colaborador));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    }

    setData(colaborador: Colaborador) {
        this.colaboradorDataTransfer = colaborador;
    }

    getData(): Colaborador | undefined {
        const colabRet = this.colaboradorDataTransfer;
        this.colaboradorDataTransfer = undefined; // Limpa o dado após a leitura
        return colabRet;
    }
}
