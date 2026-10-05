import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utilisateur } from '../models/utilisateur';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/utilisateurs/me`;

  update(value: {
    nom: string;
    prenom: string;
    telephone: string;
  }): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(this.url, value);
  }
  upload(file: File): Observable<Utilisateur> {
    const data = new FormData();
    data.append('file', file);
    return this.http.post<Utilisateur>(`${this.url}/photo`, data);
  }
  deletePhoto(): Observable<Utilisateur> {
    return this.http.delete<Utilisateur>(`${this.url}/photo`);
  }
  changePassword(value: {
    motDePasseActuel: string;
    nouveauMotDePasse: string;
    confirmation: string;
  }): Observable<void> {
    return this.http.put<void>(`${this.url}/mot-de-passe`, value);
  }
  imageUrl(path: string | null): string | null {
    return path ? `${environment.backendUrl}${path}` : null;
  }
}
