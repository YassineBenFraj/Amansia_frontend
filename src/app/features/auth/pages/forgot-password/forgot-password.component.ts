import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { httpErrorMessage } from '../../../../core/services/http-error';

@Component({ selector: 'app-forgot-password', standalone: false,
  templateUrl: './forgot-password.component.html', styleUrl: './forgot-password.component.css' })
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });
  loading = false;
  sent = false;
  error = '';
  message = '';

  submit(): void {
    if (this.loading) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.demanderReinitialisation(this.form.controls.email.value.trim())
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; }))
      .subscribe({
        next: response => { this.sent = true; this.message = response.message; },
        error: error => { this.error = httpErrorMessage(error); }
      });
  }
}
