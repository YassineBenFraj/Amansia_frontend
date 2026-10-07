import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { Commande } from '../../../../core/models/commande';
import { Paiement } from '../../../../core/models/paiement';
import { CommandeService } from '../../../../core/services/commande.service';
import { PaiementService } from '../../../../core/services/paiement.service';
import { httpErrorMessage } from '../../../../core/services/http-error';

@Component({ selector: 'app-orders', standalone: false, templateUrl: './orders.component.html', styleUrl: './orders.component.css' })
export class OrdersComponent {
  orders: Commande[] = [];
  payments = new Map<number, Paiement>();
  loading = false;
  error = '';
  private readonly ordersService = inject(CommandeService);
  private readonly paymentService = inject(PaiementService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() { this.refresh(); }

  refresh(): void {
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    forkJoin({
      orders: this.ordersService.mesCommandes(),
      payments: this.paymentService.mesPaiements().pipe(catchError(() => of([] as Paiement[])))
    }).pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ orders, payments }) => {
        this.orders = orders;
        this.payments = new Map(payments.map(payment => [payment.commandeId, payment]));
      },
      error: error => this.error = httpErrorMessage(error)
    });
  }

  paymentLabel(order: Commande): string {
    if (order.total === 0) return 'Aucun paiement nécessaire';
    const status = this.payments.get(order.id)?.statut;
    return status === 'PAYE' ? 'Payé' : status === 'ECHOUE' ? 'Échec' : status === 'EN_ATTENTE' ? 'En attente' : status === 'REMBOURSE' ? 'Remboursé' : 'Non disponible';
  }
  statusLabel(status: string): string { return status.replaceAll('_', ' ').toLowerCase().replace(/^./, letter => letter.toUpperCase()); }
}
