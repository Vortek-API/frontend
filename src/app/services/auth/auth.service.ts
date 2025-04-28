import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) { }

  login(login: string, senha: string): Observable<{grupo: string}> {
    return this.http.post<{grupo: string}>(`${this.apiUrl}/login`, { login, senha });
  }
}
