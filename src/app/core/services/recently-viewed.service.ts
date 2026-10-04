import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'amansia.recent-products';
const MAX_RECENT = 8;

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private readonly subject = new BehaviorSubject<number[]>(this.read());
  readonly ids$ = this.subject.asObservable();

  get ids(): number[] { return this.subject.value; }

  record(id: number): void {
    if (!Number.isSafeInteger(id) || id < 1) return;
    this.set([id, ...this.subject.value.filter(item => item !== id)].slice(0, MAX_RECENT));
  }

  prune(validIds: ReadonlySet<number>): void {
    const ids = this.subject.value.filter(id => validIds.has(id));
    if (ids.length !== this.subject.value.length) this.set(ids);
  }

  private set(ids: number[]): void {
    this.subject.next(ids);
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); }
    catch { /* Browsing still works when storage is unavailable. */ }
  }

  private read(): number[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed)
        ? [...new Set(parsed.filter((id): id is number => Number.isSafeInteger(id) && id > 0))].slice(0, MAX_RECENT)
        : [];
    } catch { return []; }
  }
}
