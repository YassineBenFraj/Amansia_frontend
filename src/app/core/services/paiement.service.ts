import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paiement, StripePreparation } from '../models/paiement';
@Injectable({ providedIn: 'root' })
export class PaiementService {
  private readonly url = `${environment.apiUrl}/paiements`;
  constructor(private readonly http: HttpClient) {}
  preparer(): Observable<StripePreparation> { return this.http.post<StripePreparation>(`${this.url}/stripe/preparer`, {}); }
  finaliser(paymentIntentId: string, adresseLivraisonId: number, commentaire?: string): Observable<Paiement> { return this.http.post<Paiement>(`${this.url}/stripe/finaliser`, { paymentIntentId, adresseLivraisonId, commentaire }); }
  obtenir(id: number): Observable<Paiement> { return this.http.get<Paiement>(`${this.url}/${id}`); }
  mesPaiements(): Observable<Paiement[]> { return this.http.get<Paiement[]>(`${this.url}/mes-paiements`); }
}
