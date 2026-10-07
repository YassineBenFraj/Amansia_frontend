import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paiement, StripePreparation } from '../models/paiement';
import { Commande } from '../models/commande';
@Injectable({ providedIn: 'root' })
export class PaiementService {
  private readonly url = `${environment.apiUrl}/paiements`;
  constructor(private readonly http: HttpClient) {}
  preparer(codePromo?: string): Observable<StripePreparation> { return this.http.post<StripePreparation>(`${this.url}/stripe/preparer`, { codePromo }); }
  finaliser(paymentIntentId: string, adresseLivraisonId: number, commentaire?: string, codePromo?: string): Observable<Paiement> { return this.http.post<Paiement>(`${this.url}/stripe/finaliser`, { paymentIntentId, adresseLivraisonId, commentaire, codePromo }); }
  finaliserCommandeOfferte(adresseLivraisonId: number, commentaire?: string, codePromo?: string): Observable<Commande> { return this.http.post<Commande>(`${this.url}/commande-offerte`, { adresseLivraisonId, commentaire, codePromo }); }
  obtenir(id: number): Observable<Paiement> { return this.http.get<Paiement>(`${this.url}/${id}`); }
  mesPaiements(): Observable<Paiement[]> { return this.http.get<Paiement[]>(`${this.url}/mes-paiements`); }
}
