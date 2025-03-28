import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Empresa {
  id?: number;
  nome: string;
  cnpj: string;
  telefone: string;
  foto?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  private apiUrl = 'http://localhost:4200/empresa';

  constructor(private http: HttpClient) {}

  listarEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl);
  }

  adicionarEmpresa(empresa: Empresa): Observable<any> {
    return this.http.post(this.apiUrl, empresa);
  }

  editarEmpresa(id: number, empresa: Empresa): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, empresa);
  }

  deletarEmpresa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
