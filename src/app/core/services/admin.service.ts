import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paiement } from '../models/paiement';
import { Utilisateur } from '../models/utilisateur';
import { Role } from '../models/role';

export interface UtilisateurAdminRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
  telephone?: string;
  dateNaissance?: string;
  role: Role;
  actif?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = environment.apiUrl;
  constructor(private readonly http: HttpClient) {}
  utilisateurs(): Observable<Utilisateur[]> { return this.http.get<Utilisateur[]>(`${this.api}/utilisateurs`); }
  utilisateur(id: number): Observable<Utilisateur> { return this.http.get<Utilisateur>(`${this.api}/utilisateurs/${id}`); }
  creerUtilisateur(request: UtilisateurAdminRequest): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.api}/utilisateurs`, request);
  }
  modifierUtilisateur(id: number, request: UtilisateurAdminRequest): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.api}/utilisateurs/${id}`, request);
  }
  supprimerUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/utilisateurs/${id}`);
  }
  changerStatutUtilisateur(id: number, actif: boolean): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.api}/utilisateurs/${id}/statut`, { actif });
  }
  paiements(): Observable<Paiement[]> { return this.http.get<Paiement[]>(`${this.api}/paiements/admin`); }
}
