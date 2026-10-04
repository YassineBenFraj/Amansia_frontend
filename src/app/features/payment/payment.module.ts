import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripePaymentModalComponent } from './stripe-payment-modal/stripe-payment-modal.component';
@NgModule({
  declarations: [StripePaymentModalComponent],
  imports: [CommonModule],
  exports: [StripePaymentModalComponent],
})
export class PaymentModule {}
