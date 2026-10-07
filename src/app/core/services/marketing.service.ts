import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CodePromo, CodePromoQuote, CodePromoRequest, Promotion, PromotionRequest } from '../models/marketing';

@Injectable({ providedIn: 'root' })
export class MarketingService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  promotions(): Observable<Promotion[]> { return this.http.get<Promotion[]>(`${this.url}/admin/promotions`); }
  savePromotion(request: PromotionRequest, editing = false): Observable<Promotion> {
    return editing ? this.http.put<Promotion>(`${this.url}/admin/promotions/${request.produitId}`, request)
      : this.http.post<Promotion>(`${this.url}/admin/promotions`, request);
  }
  promotionStatus(id: number, actif: boolean): Observable<Promotion> {
    return this.http.patch<Promotion>(`${this.url}/admin/promotions/${id}/statut?actif=${actif}`, {});
  }
  codes(): Observable<CodePromo[]> { return this.http.get<CodePromo[]>(`${this.url}/admin/codes-promo`); }
  saveCode(request: CodePromoRequest, id?: number): Observable<CodePromo> {
    return id ? this.http.put<CodePromo>(`${this.url}/admin/codes-promo/${id}`, request)
      : this.http.post<CodePromo>(`${this.url}/admin/codes-promo`, request);
  }
  codeStatus(id: number, actif: boolean): Observable<CodePromo> {
    return this.http.patch<CodePromo>(`${this.url}/admin/codes-promo/${id}/statut?actif=${actif}`, {});
  }
  validateCode(code: string): Observable<CodePromoQuote> {
    return this.http.post<CodePromoQuote>(`${this.url}/codes-promo/valider`, { code });
  }
}
