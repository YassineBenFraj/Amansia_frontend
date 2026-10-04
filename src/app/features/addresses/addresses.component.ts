import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Adresse, AdresseRequest } from '../../core/models/adresse';
import { AdresseService } from '../../core/services/adresse.service';
import { httpErrorMessage } from '../../core/services/http-error';
import { safeReturnUrl } from '../../core/services/return-url';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({ selector: 'app-addresses', standalone: false, templateUrl: './addresses.component.html', styleUrl: './addresses.component.css' })
export class AddressesComponent {
  @Input() selectable = false;
  @Input() selectedId: number | null = null;
  @Output() addressSelected = new EventEmitter<Adresse>();
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AdresseService);
  private readonly toast = inject(ToastService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly returnUrl = this.route.snapshot.queryParamMap.has('returnUrl')
    ? safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'))
    : null;
  addresses: Adresse[] = [];
  form = this.fb.nonNullable.group({ adresse: ['', Validators.required], ville: ['', Validators.required], gouvernorat: [''], codePostal: [''], pays: ['Tunisie'], adressePrincipale: [false] });
  editingId: number | null = null;
  loading = true; saving = false; error = ''; message = '';

  constructor() { this.load(); }
  load(): void { this.loading = true; this.service.lister().pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe({ next: addresses => this.addresses = addresses, error: e => this.error = httpErrorMessage(e) }); }
  select(address: Adresse): void { this.selectedId = address.id; this.addressSelected.emit(address); }
  edit(address: Adresse): void { this.editingId = address.id; this.form.patchValue({ adresse: address.adresse, ville: address.ville, gouvernorat: address.gouvernorat || '', codePostal: address.codePostal || '', pays: address.pays || '', adressePrincipale: address.adressePrincipale }); this.message = ''; }
  cancelEdit(): void { this.editingId = null; this.form.reset({ adresse: '', ville: '', gouvernorat: '', codePostal: '', pays: 'Tunisie', adressePrincipale: false }); }
  save(): void {
    this.form.markAllAsTouched(); if (this.form.invalid || this.saving) return;
    this.saving = true; this.error = ''; const value = this.form.getRawValue() as AdresseRequest;
    const request = this.editingId ? this.service.modifier(this.editingId, value) : this.service.creer(value);
    const wasCreating = this.editingId === null;
    request.pipe(finalize(() => this.saving = false), takeUntilDestroyed(this.destroyRef)).subscribe({ next: address => {
      this.cancelEdit();
      this.toast.success('Adresse enregistrée.');
      if (wasCreating && this.returnUrl) {
        void this.router.navigate([this.returnUrl], { queryParams: { addressId: address.id } });
        return;
      }
      this.message = '';
      this.load();
      if (this.selectable) this.select(address);
    }, error: e => this.error = httpErrorMessage(e) });
  }
  async remove(address: Adresse): Promise<void> { if (!await this.confirmation.ask('Supprimer cette adresse ?', 'Supprimer')) return; this.service.supprimer(address.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => { if (this.selectedId === address.id) this.selectedId = null; this.load(); this.toast.success('Adresse supprimée.'); }, error: e => { this.error = httpErrorMessage(e); this.toast.error(this.error); } }); }
}
