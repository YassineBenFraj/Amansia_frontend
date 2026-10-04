import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Adresse } from '../../../../core/models/adresse';
import { ImageProduit } from '../../../../core/models/catalogue';
import { Panier } from '../../../../core/models/panier';
import { AdresseService } from '../../../../core/services/adresse.service';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { PanierService } from '../../../../core/services/panier.service';
import { PaiementService } from '../../../../core/services/paiement.service';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  private readonly cartService = inject(PanierService);
  private readonly addressService = inject(AdresseService);
  private readonly catalogue = inject(CatalogueService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly paiementService = inject(PaiementService);

  cart?: Panier;
  addresses: Adresse[] = [];
  images = new Map<number, ImageProduit>();
  selectedAddressId: number | null = null;
  loading = true;
  submitting = false;
  paymentModalOpen = false; clientSecret = ''; publishableKey = '';
  error = '';
  readonly form = this.fb.nonNullable.group({ commentaire: [''] });

  constructor() {
    forkJoin({
      cart: this.cartService.obtenir(),
      addresses: this.addressService.lister(),
      images: this.catalogue.images()
    }).pipe(finalize(() => { this.loading = false; }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ cart, addresses, images }) => {
        this.cart = cart;
        this.addresses = addresses;
        const returnedId = Number(this.route.snapshot.queryParamMap.get('addressId'));
        const returnedAddress = addresses.find(address => address.id === returnedId);
        this.selectedAddressId = returnedAddress?.id
          ?? addresses.find(address => address.adressePrincipale)?.id
          ?? addresses[0]?.id
          ?? null;
        for (const image of images) {
          if (!this.images.has(image.produitId)) this.images.set(image.produitId, image);
        }
        if (!cart.lignes.length) this.error = 'Votre panier est vide.';
      },
      error: error => { this.error = httpErrorMessage(error); }
    });
  }

  selectAddress(address: Adresse): void { this.selectedAddressId = address.id; }
  productImage(id: number): string { return this.catalogue.imageUrl(this.images.get(id)); }

  submit(): void {
    if (this.submitting || !this.cart?.lignes.length || !this.selectedAddressId) return;
    if (this.clientSecret) { this.paymentModalOpen = true; return; }
    this.submitting = true;
    this.error = '';
    this.paiementService.preparer().pipe(finalize(() => { this.submitting = false; }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: preparation => { this.clientSecret = preparation.clientSecret; this.publishableKey = preparation.publishableKey; this.paymentModalOpen = true; },
      error: error => { this.error = httpErrorMessage(error); }
    });
  }
  paymentCompleted(paymentIntentId: string): void {
    if (!this.selectedAddressId || this.submitting) return;
    this.submitting = true; this.error = '';
    this.paiementService.finaliser(paymentIntentId, this.selectedAddressId, this.form.controls.commentaire.value.trim() || undefined).pipe(finalize(() => { this.submitting = false; }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: payment => { if (payment.statut === 'PAYE') { this.paymentModalOpen = false; this.cartService.reset(); void this.router.navigate(['/checkout/confirmation'], { queryParams: { orderId: payment.commandeId, paymentId: payment.id } }); } else this.error = 'Le paiement est encore en cours de confirmation.'; },
      error: error => { this.error = httpErrorMessage(error); }
    });
  }
  paymentClosed(): void { this.paymentModalOpen = false; this.error = ''; }
}
