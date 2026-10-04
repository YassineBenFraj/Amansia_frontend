import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
@Component({ selector: 'app-stripe-payment-modal', standalone: false, templateUrl: './stripe-payment-modal.component.html', styleUrl: './stripe-payment-modal.component.css' })
export class StripePaymentModalComponent {
  @Input() clientSecret = '';
  @Input() publishableKey = '';
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() completed = new EventEmitter<string>();
  loading = false; error = ''; private stripe: any; private elements: any; private paymentElement: any; private mountedSecret = '';
  async ngOnChanges(): Promise<void> {
    if (!this.open || !this.clientSecret || !this.publishableKey || this.mountedSecret === this.clientSecret) return;
    await this.mount();
  }
  private async mount(): Promise<void> {
    this.loading = true; this.error = '';
    try {
      const w = window as any;
      if (!w.Stripe) { await new Promise<void>((resolve, reject) => { const s = document.createElement('script'); s.src = 'https://js.stripe.com/v3/'; s.onload = () => resolve(); s.onerror = () => reject(new Error('Stripe indisponible')); document.head.appendChild(s); }); }
      this.stripe = w.Stripe(this.publishableKey);
      this.elements = this.stripe.elements({ clientSecret: this.clientSecret });
      const host = document.querySelector('#amansia-payment-element');
      if (!host) throw new Error('Zone de paiement indisponible');
      host.replaceChildren();
      this.paymentElement = this.elements.create('payment');
      this.paymentElement.mount(host);
      this.mountedSecret = this.clientSecret;
    } catch (e: any) { this.error = e?.message || 'Impossible de charger le paiement.'; } finally { this.loading = false; }
  }
  async pay(): Promise<void> {
    if (!this.stripe || !this.elements || this.loading) return;
    this.loading = true; this.error = '';
    try {
      const result = await this.stripe.confirmPayment({ elements: this.elements, redirect: 'if_required' });
      if (result.error) this.error = result.error.message;
      else if (result.paymentIntent?.status === 'requires_capture' && result.paymentIntent.id) this.completed.emit(result.paymentIntent.id);
      else this.error = 'Le paiement n’est pas confirmé. Aucun débit n’a été validé.';
    } catch (error: any) { this.error = error?.message || 'Le paiement a échoué.'; }
    finally { this.loading = false; }
  }
  close(): void {
    if (this.loading) return;
    this.paymentElement?.unmount();
    this.paymentElement = undefined;
    this.elements = undefined;
    this.mountedSecret = '';
    this.closed.emit();
  }
  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.open) this.close(); }
}
