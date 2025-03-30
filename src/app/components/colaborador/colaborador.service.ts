import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Data } from '@angular/router';
import { Empresa } from '../empresa/empresa.service';

export interface Colaborador {
    id: number;
    cpf: string;
    nome: string;
    cargo: string;
    hora_ent: string;
    hora_sai: string;
    status: boolean;
    empresa: { id:  number},
}

@Injectable({
    providedIn: 'root'
})
export class ColaboradorService {

    private colaborador: Colaborador | undefined;

    private apiUrl = `${environment.apiUrl}/colaborador`

    constructor(private http: HttpClient) { }

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
        this.colaborador = colaborador;
    }
    getData() : Colaborador | undefined {
        const colabRet = this.colaborador;
        this.colaborador = undefined;
        
        
        return colabRet;
    }
}
