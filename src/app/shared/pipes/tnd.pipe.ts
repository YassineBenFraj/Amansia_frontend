import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({ name: 'tnd', standalone: false })
export class TndPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    const amount = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(amount) ? `${formatNumber(amount, 'fr-FR', '1.3-3')} DT` : '—';
  }
}
