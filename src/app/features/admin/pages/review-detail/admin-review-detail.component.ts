import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Avis } from '../../../../core/models/avis';
import { AvisService } from '../../../../core/services/avis.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({ selector: 'app-admin-review-detail', standalone: false, templateUrl: './admin-review-detail.component.html', styleUrl: './admin-review-detail.component.css' })
export class AdminReviewDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(AvisService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  review?: Avis;
  loading = true;
  updating = false;
  error = '';
  message = '';

  constructor() { this.load(); }

  moderate(approved: boolean): void {
    if (!this.review || this.updating) return;
    this.updating = true; this.error = ''; this.message = '';
    this.service.moderer(this.review.id, approved).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: review => {
        this.review = review;
        this.message = approved ? 'Avis approuvé.' : 'Avis masqué.';
        this.updating = false;
      },
      error: error => { this.error = httpErrorMessage(error); this.updating = false; }
    });
  }

  async remove(): Promise<void> {
    if (!this.review || this.updating || !await this.confirmation.ask('Supprimer définitivement cet avis ?', 'Supprimer')) return;
    this.updating = true; this.error = '';
    this.service.supprimer(this.review.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => void this.router.navigate(['/admin/avis']),
      error: error => { this.error = httpErrorMessage(error); this.updating = false; }
    });
  }

  private load(): void {
    this.service.detailPourAdmin(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: review => { this.review = review; this.loading = false; },
      error: error => { this.error = httpErrorMessage(error); this.loading = false; }
    });
  }
}
