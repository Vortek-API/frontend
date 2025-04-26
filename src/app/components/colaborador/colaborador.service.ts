import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Empresa } from '../empresa/empresa.service';

export interface Colaborador {
    id: number;
    cpf: string;
    nome: string;
    cargo: string;
    horarioEntrada: string;
    horarioSaida: string;
    statusAtivo: boolean;
    dataCadastro?: string;
    foto?: string | Uint8Array;
    empresas?: Empresa[];
}

@Injectable({
    providedIn: 'root'
})
export class ColaboradorService {

    private colaboradorDataTransfer: Colaborador | undefined;
    private apiUrl = `${environment.apiUrl}/colaborador`;

    private jsonHeaders = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    constructor(private http: HttpClient) { }

    async findAll(): Promise<Colaborador[]> {
        const colabs = await firstValueFrom(this.http.get<Colaborador[]>(this.apiUrl));
        colabs.forEach(async (colab: Colaborador) => {
            if (colab.foto) colab.foto = await this.findFoto(colab.id);
        });

        return colabs;
    }

    async find(id: number): Promise<Colaborador> {
        return firstValueFrom(this.http.get<Colaborador>(`${this.apiUrl}/${id}`));
    }

    async add(colaborador: Colaborador): Promise<Colaborador> {
        const payload = {
            colaborador: colaborador,
            empresasId: colaborador.empresas?.map(e => e.id) ?? []
          };
          
          return firstValueFrom(this.http.post<Colaborador>(this.apiUrl, payload, {
            headers: this.jsonHeaders
          }));
          
    }

    async update(id: number, colaborador: Colaborador): Promise<Colaborador> {
        const payload = {
            colaborador: colaborador,
            empresasId: colaborador.empresas?.map(e => e.id) ?? []
          };
          colaborador.empresas = undefined;
        return firstValueFrom(this.http.put<Colaborador>(`${this.apiUrl}/${id}`, payload, {
            headers: this.jsonHeaders
        }));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    }
    async findFoto(id: number): Promise<string>  {
        return firstValueFrom(this.http.get<string>(`${this.apiUrl}/${id}/foto`));
    }

    setData(colaborador: Colaborador) {
        this.colaboradorDataTransfer = colaborador;
    }

    getData(): Colaborador | undefined {
        const colabRet = this.colaboradorDataTransfer;
        this.colaboradorDataTransfer = undefined;
        return colabRet;
    }
}
