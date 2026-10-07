import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { ToastService } from '../../../../core/services/toast.service';

@Component({ selector: 'app-reset-password', standalone: false,
  templateUrl: './reset-password.component.html', styleUrl: './reset-password.component.css' })
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  readonly form = this.fb.nonNullable.group({
    nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmationMotDePasse: ['', Validators.required]
  });
  loading = false;
  done = false;
  error = '';
  showPassword = false;

  submit(): void {
    if (this.loading || this.done) return;
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.token) return;
    const value = this.form.getRawValue();
    if (value.nouveauMotDePasse !== value.confirmationMotDePasse) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.reinitialiserMotDePasse({ token: this.token, ...value })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; }))
      .subscribe({
        next: () => {
          this.form.reset();
          this.done = true;
          this.toast.success('Votre mot de passe a été réinitialisé avec succès.');
        },
        error: error => { this.error = httpErrorMessage(error); }
      });
  }
}
