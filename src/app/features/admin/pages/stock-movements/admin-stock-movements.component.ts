import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MouvementStock } from '../../../../core/models/stock';
import { StockService } from '../../../../core/services/stock.service';
import { httpErrorMessage } from '../../../../core/services/http-error';

@Component({ selector: 'app-admin-stock-movements', standalone: false, templateUrl: './admin-stock-movements.component.html', styleUrl: './admin-stock-movements.component.css' })
export class AdminStockMovementsComponent {
  private readonly service = inject(StockService);
  private readonly destroyRef = inject(DestroyRef);
  movements: MouvementStock[] = [];
  search = '';
  type = '';
  date = '';
  loading = true;
  error = '';

  constructor() {
    this.service.mouvements().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: movements => { this.movements = movements; this.loading = false; },
      error: error => { this.error = httpErrorMessage(error); this.loading = false; }
    });
  }

  get filtered(): MouvementStock[] {
    const query = this.search.trim().toLocaleLowerCase();
    return this.movements.filter(m => (!this.type || m.typeMouvement === this.type) && (!this.date || m.dateMouvement?.startsWith(this.date)) && (!query || `${m.produitNom} ${m.referenceVariante} ${m.reference || ''} ${m.motif || ''}`.toLocaleLowerCase().includes(query)));
  }
}
