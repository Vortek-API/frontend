import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { Empresa } from '../../components/empresa/empresa.service';


export interface UserLogado {
  id: number;
  login: string;
  grupo: string;
  empresas: Empresa[];
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private userLogado: UserLogado | undefined;

  constructor(private http: HttpClient) { }

  async login(login: string, senha: string): Promise<UserLogado> {
    let user: UserLogado = await firstValueFrom(this.http.post<UserLogado>(`${this.apiUrl}/login`, { login, senha }));
    this.userLogado = user;

    console.log(user.empresas);

    return user;
  }
  getUserLogado() {
    return this.userLogado;
  }

  setUserLogado(user: UserLogado) {
    this.userLogado = user;
  }
}
