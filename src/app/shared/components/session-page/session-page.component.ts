import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { httpErrorMessage } from '../../../core/services/http-error';
import { Role } from '../../../core/models/role';

@Component({ selector: 'app-session-page', standalone: false, templateUrl: './session-page.component.html', styleUrl: './session-page.component.css' })
export class SessionPageComponent {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly page = this.route.snapshot.data['page'] as string;
  readonly adminRole = Role.ADMINISTRATEUR;
  readonly roleLabels: Record<Role, string> = {
    CLIENT: 'Client', ADMINISTRATEUR: 'Administrateur'
  };
  loading = false;
  message = '';
  error = '';

  refresh(): void {
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    this.message = '';
    this.auth.me().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; })).subscribe({
      next: () => { this.message = 'Votre compte est à jour.'; },
      error: (error: unknown) => { this.error = httpErrorMessage(error); }
    });
  }
}
