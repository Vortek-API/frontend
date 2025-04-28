import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Colaborador, ColaboradorService } from '../../colaborador/colaborador.service';

export interface PontoDetalhado {
    id: number;
    colaboradorId: number;
    empresaId: number;
    data: string;
    horaEntrada: string;
    horaSaida: string;
    tempoTotal: string;
}

@Injectable({
    providedIn: 'root'
})
export class RegistroPontoService {

    private apiUrl = `${environment.apiUrl}/ponto`

    constructor(private http: HttpClient
    ) { }

    async findAll(): Promise<PontoDetalhado[]> {
        return firstValueFrom(this.http.get<PontoDetalhado[]>(`${this.apiUrl}/detalhado`));
    }
    async find(id: number): Promise<PontoDetalhado> {
        return firstValueFrom(this.http.get<PontoDetalhado>(`${this.apiUrl}/${id}/detalhado`));
    }
    async findByColabId(id: number) : Promise<PontoDetalhado[]> {
        return firstValueFrom(this.http.get<PontoDetalhado[]>(`${this.apiUrl}?colaboradorId=${id}`));
    }
}
