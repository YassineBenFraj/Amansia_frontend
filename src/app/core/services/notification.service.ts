import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, distinctUntilChanged, filter, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationItem, NotificationType } from '../models/notification';
import { AuthService } from './auth.service';
import { httpErrorMessage } from './http-error';
import { safeReturnUrl } from './return-url';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly url = `${environment.apiUrl}/notifications`;
  private userId: number | null = null;
  private readonly listSubject = new BehaviorSubject<NotificationItem[]>([]);
  private readonly countSubject = new BehaviorSubject<number>(0);
  readonly items$ = this.listSubject.asObservable();
  readonly recent$ = this.items$.pipe(map(items => items.slice(0, 5)));
  readonly count$ = this.countSubject.asObservable();
  loading = false;
  error = '';

  constructor() {
    this.auth.user$.pipe(map(user => user?.id ?? null), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(id => {
        this.userId = id;
        this.listSubject.next([]);
        this.countSubject.next(0);
        this.loading = false;
        this.error = '';
        if (id) this.refreshCount();
      });
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => { if (this.userId) this.refreshCount(); });
  }

  refreshCount(): void {
    const id = this.userId;
    if (!id) return;
    this.http.get<{ count: number }>(`${this.url}/non-lues/count`).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: value => { if (this.userId === id) this.countSubject.next(value.count); }, error: () => { /* Keep last known count. */ } });
  }

  load(): void {
    const id = this.userId;
    if (!id || this.loading) return;
    this.loading = true;
    this.error = '';
    this.http.get<NotificationItem[]>(this.url).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: items => { if (this.userId === id) { this.listSubject.next(items); this.loading = false; this.refreshCount(); } },
        error: error => { if (this.userId === id) { this.error = httpErrorMessage(error); this.loading = false; } }
      });
  }

  markRead(item: NotificationItem): Observable<NotificationItem> {
    return this.http.put<NotificationItem>(`${this.url}/${item.id}/lue`, {}).pipe(tap(updated => {
      this.listSubject.next(this.listSubject.value.map(current => current.id === updated.id ? updated : current));
      this.refreshCount();
    }));
  }

  markAllRead(): void {
    if (!this.userId) return;
    this.http.put<void>(`${this.url}/tout-lire`, {}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.listSubject.next(this.listSubject.value.map(item => ({ ...item, estLue: true }))); this.refreshCount(); },
      error: error => this.toast.error(httpErrorMessage(error))
    });
  }

  open(item: NotificationItem): void {
    this.markRead(item).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { if (item.lien) { const link = safeReturnUrl(item.lien); if (link !== '/') void this.router.navigateByUrl(link); } },
      error: error => this.toast.error(httpErrorMessage(error))
    });
  }

  icon(type: NotificationType): string {
    if (type === 'PAIEMENT_CONFIRME') return '✓';
    if (type === 'STOCK_DISPONIBLE' || type === 'STOCK_FAIBLE' || type === 'RUPTURE_STOCK') return '▣';
    if (type === 'NOUVEL_AVIS' || type === 'AVIS_MODIFIE') return '★';
    return '▤';
  }
}
