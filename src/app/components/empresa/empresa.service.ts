import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface Empresa {
    id: number;
    nome: string;
    cnpj: string;
    colaboradores: number;
}

@Injectable({
    providedIn: 'root'
})
export class EmpresaService {

    private apiUrl = `${environment.apiUrl}/empresa`

    constructor(private http: HttpClient) { }

    async findAll(): Promise<Empresa[]> {
        return firstValueFrom(this.http.get<Empresa[]>(this.apiUrl));
    }

    async find(id: number): Promise<Empresa> {
        return firstValueFrom(this.http.get<Empresa>(`${this.apiUrl}/${id}`));
    }

    async add(empresa: Empresa): Promise<Empresa> {
        return firstValueFrom(this.http.post<Empresa>(this.apiUrl, empresa));
    }

    async update(id: number, empresa: Empresa): Promise<Empresa> {
        return firstValueFrom(this.http.put<Empresa>(`${this.apiUrl}/${id}`, empresa));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    }

}
