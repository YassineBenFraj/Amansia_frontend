import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Commande } from '../../../../core/models/commande';
import { CommandeService } from '../../../../core/services/commande.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { PanierService } from '../../../../core/services/panier.service';
import { Paiement } from '../../../../core/models/paiement';
import { PaiementService } from '../../../../core/services/paiement.service';

@Component({ selector: 'app-order-confirmation', standalone: false, templateUrl: './order-confirmation.component.html', styleUrl: './order-confirmation.component.css' })
export class OrderConfirmationComponent {
  order?: Commande; payment?: Paiement; loading = true; error = '';
  private readonly orders = inject(CommandeService); private readonly cart = inject(PanierService);
  private readonly payments = inject(PaiementService); private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    const orderId = Number(this.route.snapshot.queryParamMap.get('orderId'));
    const paymentId = Number(this.route.snapshot.queryParamMap.get('paymentId'));
    if (!orderId) { this.loading = false; this.error = 'Commande introuvable.'; return; }
    this.orders.detail(orderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: order => { this.order = order; if (!paymentId && order.total === 0) { this.cart.reset(); this.loading = false; return; }
        if (!paymentId) { this.error = 'Paiement introuvable.'; this.loading = false; return; }
        this.payments.obtenir(paymentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: payment => { this.payment = payment; if (payment.statut === 'PAYE') this.cart.reset(); this.loading = false; },
        error: error => { this.error = httpErrorMessage(error); this.loading = false; }
      }); },
      error: error => { this.error = httpErrorMessage(error); this.loading = false; }
    });
  }
  paymentLabel(): string { return this.order?.total === 0 ? 'Aucun paiement nécessaire' : this.payment?.statut === 'PAYE' ? 'Paiement confirmé' : 'Paiement non confirmé'; }
}
