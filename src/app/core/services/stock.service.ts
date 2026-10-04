import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MouvementStock, MouvementStockRequest, Stock } from '../models/stock';

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/stocks`;

  produit(id: number): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.url}/produit/${id}`);
  }

  adminStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.url}/admin`);
  }

  mouvements(): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.url}/admin/mouvements`);
  }

  ajouterMouvement(request: MouvementStockRequest): Observable<Stock> {
    return this.http.post<Stock>(`${this.url}/admin/mouvements`, request);
  }
}
