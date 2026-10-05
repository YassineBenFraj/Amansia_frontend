import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { CommandeService } from '../../../../core/services/commande.service';
import { AdminService } from '../../../../core/services/admin.service';
import { StockService } from '../../../../core/services/stock.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Commande } from '../../../../core/models/commande';
import { Stock } from '../../../../core/models/stock';
import { stockState, StockState } from '../../../../core/models/stock-state';

interface SalesDay { key: string; label: string; total: number; height: number; }

@Component({ selector: 'app-admin-dashboard', standalone: false, templateUrl: './admin-dashboard.component.html', styleUrl: './admin-dashboard.component.css' })
export class AdminDashboardComponent {
  private readonly catalogue = inject(CatalogueService);
  private readonly commandes = inject(CommandeService);
  private readonly admin = inject(AdminService);
  private readonly stockService = inject(StockService);
  readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  loading = true;
  error = '';
  produits = 0;
  commandesCount = 0;
  clients = 0;
  revenue = 0;
  pendingOrders = 0;
  stockCounts: Record<StockState, number> = { disponible: 0, alerte: 0, rupture: 0 };
  criticalStocks: Stock[] = [];
  recentOrders: Commande[] = [];
  salesDays: SalesDay[] = [];

  constructor() {
    this.load();
    this.notifications.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      produits: this.catalogue.produitsAdmin(),
      commandes: this.commandes.toutes(),
      utilisateurs: this.admin.utilisateurs(),
      paiements: this.admin.paiements(),
      stocks: this.stockService.adminStocks(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.produits = data.produits.length;
        this.commandesCount = data.commandes.length;
        this.clients = data.utilisateurs.filter(user => user.role === 'CLIENT').length;
        this.pendingOrders = data.commandes.filter(order => order.statut === 'EN_ATTENTE').length;
        this.recentOrders = [...data.commandes].sort((a, b) => new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime()).slice(0, 5);
        const paid = data.paiements.filter(payment => payment.statut === 'PAYE');
        this.revenue = paid.reduce((sum, payment) => sum + payment.montant, 0);
        this.salesDays = this.buildSalesDays(paid);
        this.stockCounts = { disponible: 0, alerte: 0, rupture: 0 };
        data.stocks.forEach(stock => this.stockCounts[stockState(stock)]++);
        this.criticalStocks = data.stocks.filter(stock => stockState(stock) !== 'disponible')
          .sort((a, b) => a.quantite - b.quantite || a.produitNom.localeCompare(b.produitNom)).slice(0, 5);
        this.loading = false;
      },
      error: () => { this.error = 'Impossible de charger le tableau de bord. Réessayez dans un instant.'; this.loading = false; },
    });
  }

  stockLabel(stock: Stock): string { return { disponible: 'Disponible', alerte: 'Stock faible', rupture: 'Rupture' }[stockState(stock)]; }
  stockStatus(stock: Stock): string { return stockState(stock) === 'alerte' ? 'STOCK_FAIBLE' : stockState(stock).toUpperCase(); }

  private buildSalesDays(paid: { montant: number; datePaiement?: string }[]): SalesDay[] {
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index);
      return { key: this.dayKey(date), label: new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date), total: 0, height: 0 };
    });
    for (const payment of paid) {
      if (!payment.datePaiement) continue;
      const day = days.find(item => item.key === this.dayKey(new Date(payment.datePaiement!)));
      if (day) day.total += payment.montant;
    }
    const maximum = Math.max(...days.map(day => day.total), 0);
    days.forEach(day => day.height = maximum ? Math.max(3, Math.round(day.total / maximum * 100)) : 0);
    return days;
  }

  private dayKey(date: Date): string { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; }
}
