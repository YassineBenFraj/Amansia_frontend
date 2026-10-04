import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Avis, AvisCreationRequest, AvisUpdateRequest } from '../models/avis';

@Injectable({ providedIn: 'root' })
export class AvisService {
  private readonly url = `${environment.apiUrl}/avis`;

  constructor(private readonly http: HttpClient) {}

  listerPourProduit(produitId: number): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.url}/produit/${produitId}`);
  }

  listerPourAdmin(produitId: number): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.url}/produit/${produitId}`);
  }

  listerTousPourAdmin(): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.url}/admin`);
  }

  detailPourAdmin(id: number): Observable<Avis> {
    return this.http.get<Avis>(`${this.url}/${id}`);
  }

  creer(request: AvisCreationRequest): Observable<Avis> {
    return this.http.post<Avis>(this.url, request);
  }

  modifier(id: number, request: AvisUpdateRequest): Observable<Avis> {
    return this.http.put<Avis>(`${this.url}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  moderer(id: number, approuve: boolean): Observable<Avis> {
    return this.http.put<Avis>(`${this.url}/${id}/approbation`, null, { params: { approuve } });
  }
}
