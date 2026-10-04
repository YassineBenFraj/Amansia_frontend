import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly subject = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this.subject.asObservable();
  private nextId = 0;

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  info(message: string): void { this.show(message, 'info'); }

  dismiss(id: number): void {
    this.subject.next(this.subject.value.filter(toast => toast.id !== id));
  }

  private show(message: string, type: Toast['type']): void {
    const toast = { id: ++this.nextId, message, type };
    this.subject.next([...this.subject.value.slice(-3), toast]);
    setTimeout(() => this.dismiss(toast.id), type === 'error' ? 7000 : 4200);
  }
}
