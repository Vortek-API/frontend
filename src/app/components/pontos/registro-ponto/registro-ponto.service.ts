import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Colaborador, ColaboradorService } from '../../colaborador/colaborador.service';

export interface PontoDetalhado {
    id?: number;
    colaboradorId: number;
    empresaId: number;
    data: string;
    horaEntrada: string;
    horaSaida: string;
    tempoTotal?: string;
    justificativa: string;
}

@Injectable({
    providedIn: 'root'
})
export class RegistroPontoService {

    private apiUrl = `${environment.apiUrl}/ponto`
    private jsonHeaders = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    private registroDataTransfer: PontoDetalhado | undefined;

    constructor(private http: HttpClient
    ) { }

    async findAll(): Promise<PontoDetalhado[]> {
        return firstValueFrom(this.http.get<PontoDetalhado[]>(`${this.apiUrl}/detalhado`));
    }
    async find(id: number): Promise<PontoDetalhado> {
        return firstValueFrom(this.http.get<PontoDetalhado>(`${this.apiUrl}/${id}/detalhado`));
    }
    async findByColabId(id: number) : Promise<PontoDetalhado[]> {
        return firstValueFrom(this.http.get<PontoDetalhado[]>(`${this.apiUrl}/detalhado?colaboradorId=${id}`));
    }
    async add(ponto: PontoDetalhado): Promise<PontoDetalhado> {
            return firstValueFrom(this.http.post<PontoDetalhado>(`${this.apiUrl}/${ponto.colaboradorId}/${ponto.empresaId}`, ponto, {
            headers: this.jsonHeaders
        }));

    }
    
    setData(registro: PontoDetalhado) {
        this.registroDataTransfer = registro;
    }

    getData(): PontoDetalhado | undefined {
        const registroRet = this.registroDataTransfer;
        this.registroDataTransfer = undefined;
        return registroRet;
    }
    async update(id: number,ponto: PontoDetalhado): Promise<PontoDetalhado> {
        return firstValueFrom(this.http.patch<PontoDetalhado>(`${this.apiUrl}/${id}/editar`, ponto,  {
            headers: this.jsonHeaders
        }));
    }
}
