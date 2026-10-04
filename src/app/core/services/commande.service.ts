import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Commande, CommandeRequest } from '../models/commande';

export const LAST_ORDER_KEY = 'amansia_last_order_id';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private readonly url = `${environment.apiUrl}/commandes`;
  constructor(private readonly http: HttpClient) {}
  creer(request: CommandeRequest): Observable<Commande> {
    return this.http.post<Commande>(this.url, request).pipe(tap(order => localStorage.setItem(LAST_ORDER_KEY, String(order.id))));
  }
  mesCommandes(): Observable<Commande[]> { return this.http.get<Commande[]>(`${this.url}/mes-commandes`); }
  toutes(): Observable<Commande[]> { return this.http.get<Commande[]>(`${this.url}/admin`); }
  detailAdmin(id: number): Observable<Commande> { return this.http.get<Commande>(`${this.url}/admin/${id}`); }
  changerStatut(id: number, statut: string): Observable<Commande> { return this.http.put<Commande>(`${this.url}/admin/${id}/statut`, { statut }); }
  detail(id: number): Observable<Commande> { return this.http.get<Commande>(`${this.url}/${id}`); }
  dernierId(): number | null { const value = Number(localStorage.getItem(LAST_ORDER_KEY)); return Number.isInteger(value) && value > 0 ? value : null; }
}
