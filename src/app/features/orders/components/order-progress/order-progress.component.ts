import { Component, Input } from '@angular/core';

const STEPS = [
  { status: 'CONFIRMEE', label: 'Confirmée' },
  { status: 'EN_PREPARATION', label: 'En préparation' },
  { status: 'EXPEDIEE', label: 'Expédiée' },
  { status: 'EN_LIVRAISON', label: 'En livraison' },
  { status: 'LIVREE', label: 'Livrée' },
];

@Component({
  selector: 'app-order-progress',
  standalone: false,
  templateUrl: './order-progress.component.html',
  styleUrl: './order-progress.component.css',
})
export class OrderProgressComponent {
  @Input({ required: true }) status = '';
  @Input() compact = false;
  readonly steps = STEPS;
  get currentIndex(): number {
    return STEPS.findIndex((step) => step.status === this.status);
  }
  get waiting(): boolean {
    return this.status === 'EN_ATTENTE';
  }
  get cancelled(): boolean {
    return this.status === 'ANNULEE';
  }
  state(index: number): 'done' | 'current' | 'future' {
    if (this.status === 'LIVREE') return 'done';
    return index < this.currentIndex
      ? 'done'
      : index === this.currentIndex
        ? 'current'
        : 'future';
  }
}
