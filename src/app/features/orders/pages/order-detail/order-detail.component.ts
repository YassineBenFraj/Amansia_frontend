import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import { Commande, LigneCommande } from '../../../../core/models/commande';
import { Paiement } from '../../../../core/models/paiement';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { CommandeService } from '../../../../core/services/commande.service';
import { PaiementService } from '../../../../core/services/paiement.service';
import { httpErrorMessage } from '../../../../core/services/http-error';

@Component({ selector: 'app-order-detail', standalone: false, templateUrl: './order-detail.component.html', styleUrl: './order-detail.component.css' })
export class OrderDetailComponent {
  order?: Commande;
  payment?: Paiement;
  images = new Map<number, string>();
  loading = false;
  error = '';
  private readonly orders = inject(CommandeService);
  private readonly payments = inject(PaiementService);
  private readonly catalogue = inject(CatalogueService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  constructor() {
    if (!Number.isInteger(this.id) || this.id < 1) { this.error = 'Commande introuvable.'; return; }
    this.refresh();
  }

  refresh(): void {
    if (this.loading || !Number.isInteger(this.id) || this.id < 1) return;
    this.loading = true;
    this.error = '';
    forkJoin({
      order: this.orders.detail(this.id),
      payments: this.payments.mesPaiements().pipe(catchError(() => of([] as Paiement[])))
    }).pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ order, payments }) => {
        this.order = order;
        this.payment = payments.find(item => item.commandeId === order.id);
        this.loadImages(order);
      },
      error: error => this.error = httpErrorMessage(error)
    });
  }

  image(line: LigneCommande): string { return this.images.get(line.produitId) || this.catalogue.imageUrl(null); }
  get paymentLabel(): string {
    if (this.order?.total === 0) return 'Aucun paiement nécessaire';
    switch (this.payment?.statut) {
      case 'PAYE': return 'Payé';
      case 'EN_ATTENTE': return 'En attente';
      case 'ECHOUE': return 'Échec';
      case 'REMBOURSE': return 'Remboursé';
      default: return 'Non disponible';
    }
  }
  statusLabel(status: string): string { return status.replaceAll('_', ' ').toLowerCase().replace(/^./, letter => letter.toUpperCase()); }

  private loadImages(order: Commande): void {
    const ids = [...new Set(order.lignes.map(line => line.produitId).filter(id => Number.isInteger(id) && id > 0))];
    this.images = new Map();
    if (!ids.length) return;
    forkJoin(ids.map(id => this.catalogue.imagesProduit(id).pipe(
      map(images => {
        const image = [...images].sort((a, b) => Number(b.principale) - Number(a.principale) || a.ordre - b.ordre)[0];
        return [id, this.catalogue.imageUrl(image)] as const;
      }),
      catchError(() => of([id, this.catalogue.imageUrl(null)] as const))
    ))).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(images => this.images = new Map(images));
  }
}
