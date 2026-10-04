import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmationRequest {
  message: string;
  confirmLabel: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  private readonly requestSubject = new BehaviorSubject<ConfirmationRequest | null>(null);
  readonly request$ = this.requestSubject.asObservable();
  private resolveCurrent?: (confirmed: boolean) => void;
  private returnFocus: HTMLElement | null = null;

  ask(message: string, confirmLabel = 'Confirmer'): Promise<boolean> {
    this.answer(false);
    this.returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.requestSubject.next({ message, confirmLabel });
    return new Promise(resolve => { this.resolveCurrent = resolve; });
  }

  answer(confirmed: boolean): void {
    this.resolveCurrent?.(confirmed);
    this.resolveCurrent = undefined;
    this.requestSubject.next(null);
    const target = this.returnFocus;
    this.returnFocus = null;
    if (target) setTimeout(() => target.focus(), 0);
  }
}
