import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Stock, MouvementStockRequest } from '../../../../core/models/stock';
import { StockService } from '../../../../core/services/stock.service';
import { ToastService } from '../../../../core/services/toast.service';
import { httpErrorMessage } from '../../../../core/services/http-error';

@Component({ selector: 'app-admin-stocks', standalone: false, templateUrl: './admin-stocks.component.html', styleUrl: './admin-stocks.component.css' })
export class AdminStocksComponent {
  private readonly service = inject(StockService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  stocks: Stock[] = [];
  search = '';
  filter = '';
  loading = true;
  saving = false;
  error = '';
  editing: Stock | null = null;
  movement: MouvementStockRequest = { varianteId: 0, typeMouvement: 'ENTREE', quantite: 1, motif: '' };

  constructor() { this.load(); }

  get filtered(): Stock[] {
    const query = this.search.trim().toLocaleLowerCase();
    return this.stocks.filter(stock => {
      const state = stock.quantite === 0 ? 'rupture' : stock.quantite <= stock.seuilAlerte ? 'alerte' : 'disponible';
      return (!this.filter || this.filter === state) && (!query || `${stock.produitNom} ${stock.reference} ${stock.couleur || ''} ${stock.materiau || ''}`.toLocaleLowerCase().includes(query));
    });
  }

  state(stock: Stock): string {
    return stock.quantite === 0 ? 'Rupture' : stock.quantite <= stock.seuilAlerte ? 'Stock faible' : 'Disponible';
  }

  open(stock: Stock): void {
    this.editing = stock;
    this.movement = { varianteId: stock.varianteId, typeMouvement: 'ENTREE', quantite: 1, motif: '' };
  }

  close(): void { if (!this.saving) this.editing = null; }

  save(): void {
    if (this.saving || !this.editing || !Number.isInteger(this.movement.quantite) || this.movement.quantite < 1 || !this.movement.motif.trim()) return;
    this.saving = true;
    this.service.ajouterMouvement({ ...this.movement, motif: this.movement.motif.trim() })
      .pipe(finalize(() => this.saving = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.editing = null; this.toast.success('Mouvement enregistré.'); this.load(); },
        error: error => this.toast.error(httpErrorMessage(error))
      });
  }

  private load(): void {
    this.loading = true;
    this.error = '';
    this.service.adminStocks().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: stocks => { this.stocks = stocks; this.loading = false; },
      error: error => { this.error = httpErrorMessage(error); this.loading = false; }
    });
  }
}
