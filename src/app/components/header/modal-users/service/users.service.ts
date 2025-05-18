import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/lista`);
  }

  createUsers(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/novo-usuario`, user);
  }

  getEmpresas(): Observable<{ id: number; nome: string }[]> {
    return this.http.get<{ id: number; nome: string }[]>(`${this.apiUrl}/empresa/lista`);
  }

deleteUser(usuarioId: number) {
     return this.http.delete(`${this.apiUrl}/usuarios/deletar/${usuarioId}`);
  }

  updateUserEmpresas(usuarioId: number, empresasIds: number[]) {
  return this.http.put(`${this.apiUrl}/usuarios/${usuarioId}/empresas`, empresasIds);}
}