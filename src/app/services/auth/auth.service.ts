import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Empresa } from '../../components/empresa/empresa.service';
import { UsersService } from '../../components/header/modal-users/service/users.service';


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

  constructor(private http: HttpClient,
    private userService: UsersService
  ) { }


  async login(login: string, senha: string): Promise<UserLogado> {
    let user: UserLogado = await firstValueFrom(this.http.post<UserLogado>(`${this.apiUrl}/login`, { login, senha }));

    sessionStorage.setItem('userId', user.id.toString());
    return user;
  }

  async getUserLogado() {
    return await this.userService.find(sessionStorage.getItem('userId') as unknown as number);
  }
}
