import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Adresse, AdresseRequest } from '../models/adresse';

@Injectable({ providedIn: 'root' })
export class AdresseService {
  private readonly url = `${environment.apiUrl}/adresses`;
  constructor(private readonly http: HttpClient) {}
  lister(): Observable<Adresse[]> { return this.http.get<Adresse[]>(this.url); }
  creer(request: AdresseRequest): Observable<Adresse> { return this.http.post<Adresse>(this.url, request); }
  modifier(id: number, request: AdresseRequest): Observable<Adresse> { return this.http.put<Adresse>(`${this.url}/${id}`, request); }
  supprimer(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
