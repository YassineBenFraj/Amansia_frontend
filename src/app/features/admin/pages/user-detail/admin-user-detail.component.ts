import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Utilisateur } from '../../../../core/models/utilisateur';
import { AdminService } from '../../../../core/services/admin.service';
import { httpErrorMessage } from '../../../../core/services/http-error';

@Component({ selector: 'app-admin-user-detail', standalone: false, templateUrl: './admin-user-detail.component.html', styleUrl: './admin-user-detail.component.css' })
export class AdminUserDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  user?: Utilisateur;
  loading = true;
  error = '';
  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.admin.utilisateur(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => { this.user = user; this.loading = false; },
      error: error => { this.error = httpErrorMessage(error); this.loading = false; }
    });
  }
}
