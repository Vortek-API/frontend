import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  getResumoDashboard(filtros?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.empresa) params = params.append('empresa', filtros.empresa);
      if (filtros.dataInicio) params = params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params = params.append('dataFim', filtros.dataFim);
      if (filtros.status) params = params.append('status', filtros.status);
      if (filtros.categoria) params = params.append('categoria', filtros.categoria);
      if (filtros.ordenacao) params = params.append('ordenacao', filtros.ordenacao);
    }
    
    return this.http.get(`${this.apiUrl}/resumo`, { params });
  }
  
  getEmpresas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/empresas`);
  }
  
  getStatus(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/status`);
  }
  
  exportarRelatorio(filtros?: any): Observable<Blob> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.empresa) params = params.append('empresa', filtros.empresa);
      if (filtros.dataInicio) params = params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params = params.append('dataFim', filtros.dataFim);
      if (filtros.status) params = params.append('status', filtros.status);
      if (filtros.categoria) params = params.append('categoria', filtros.categoria);
    }
    
    return this.http.get(`${this.apiUrl}/exportar`, { 
      params, 
      responseType: 'blob' 
    });
  }
}