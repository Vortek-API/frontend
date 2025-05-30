import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Empresa } from '../empresa/empresa.service';
import { PontoDetalhado, RegistroPontoService } from '../pontos/registro-ponto/registro-ponto.service';

export interface Colaborador {
    id: number;
    cpf: string;
    nome: string;
    cargo: string;
    horarioEntrada: string;
    horarioSaida: string;
    statusAtivo: boolean;
    dataCadastro?: string;
    foto?: string | Uint8Array | null;
    empresas?: Empresa[];
}

export interface ColaboradorDto {
    id: number;
    cpf: string;
    nome: string;
    cargo: string;
    horarioEntrada: string;
    horarioSaida: string;
    statusAtivo: boolean;
    dataCadastro?: string;
    foto?: string | Uint8Array | null;
}

export interface ColaboradorRequest {
  colaborador: ColaboradorDto; 
  empresasId: number[];  
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

    constructor(private http: HttpClient, private pontoService: RegistroPontoService) { }

    async findAll(): Promise<Colaborador[]> {
        const colabs = await firstValueFrom(this.http.get<Colaborador[]>(this.apiUrl));
        colabs.forEach(async (colab: Colaborador) => {
            if (colab.foto) colab.foto = await this.findFoto(colab.id);
        });

        colabs.sort((a, b) => a.nome.localeCompare(b.nome));
        return colabs;
    }

    async find(id: number): Promise<Colaborador> {
        const colab = await firstValueFrom(this.http.get<Colaborador>(`${this.apiUrl}/${id}`));
        if (colab.foto) colab.foto = await this.findFoto(colab.id);

        return colab;
    }

    async add(colaboradorData: ColaboradorDto, empresasIdArray : number[]): Promise<ColaboradorDto> {
        //const empresasIdArray = empresasAssociadas?.map(e => e.id) ?? [];

        const requestPayload: ColaboradorRequest = {
            colaborador: colaboradorData, 
            empresasId: empresasIdArray   
        };

        return firstValueFrom(this.http.post<ColaboradorDto>(this.apiUrl, requestPayload, {
            headers: this.jsonHeaders
        }));

    }

    async update(id: number, colaborador: Colaborador): Promise<Colaborador> {
        const payload = {
            colaborador: colaborador,
            empresasId: colaborador.empresas?.map(e => e.id) ?? []
        };
        //colaborador.empresas = undefined;
        return firstValueFrom(this.http.put<Colaborador>(`${this.apiUrl}/${id}`, payload, {
            headers: this.jsonHeaders
        }));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    }
    async findFoto(id: number): Promise<string> {
        const arrayBuffer = await firstValueFrom(this.http.get(`${this.apiUrl}/${id}/foto`, {
            responseType: 'arraybuffer' as 'json' 
        }));
        const bytes = new Uint8Array(arrayBuffer as ArrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64String = window.btoa(binary);

        return base64String;  // Retorna já convertido para o componente
    }

    setData(colaborador: Colaborador) {
        this.colaboradorDataTransfer = colaborador;
    }

    getData(): Colaborador | undefined {
        const colabRet = this.colaboradorDataTransfer;
        this.colaboradorDataTransfer = undefined;
        return colabRet;
    }
    async hasRegistro(id: number): Promise<boolean> {
        const ponto: PontoDetalhado[] = await this.pontoService.findByColabId(id);
        return ponto.length > 0 ? true : false;
    }
}
