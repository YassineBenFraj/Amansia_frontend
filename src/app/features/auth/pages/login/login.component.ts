import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { safeReturnUrl } from '../../../../core/services/return-url';
import { Role } from '../../../../core/models/role';
import { ToastService } from '../../../../core/services/toast.service';

@Component({ selector: 'app-login', standalone: false, templateUrl: './login.component.html', styleUrl: './login.component.css' })
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly returnUrl = safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
  readonly expired = this.route.snapshot.queryParamMap.get('session') === 'expired';
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required]
  });
  loading = false;
  error = '';
  showPassword = false;

  submit(): void {
    if (this.loading) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.error = '';
    this.loading = true;
    const value = this.form.getRawValue();
    this.auth.login({ ...value, email: value.email.trim() }).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; })
    ).subscribe({
      next: user => {
        this.form.controls.motDePasse.reset();
        this.toast.success('Bienvenue sur Amansia.');
        const destination = user.role === Role.ADMINISTRATEUR ? '/admin/dashboard' : this.returnUrl;
        void this.router.navigateByUrl(destination);
      },
      error: (error: unknown) => { this.error = httpErrorMessage(error); }
    });
  }

  googleLogin(credential: string): void {
    if (this.loading) return;
    this.error = '';
    this.loading = true;
    this.auth.google(credential).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; })
    ).subscribe({
      next: user => {
        this.toast.success('Bienvenue sur Amansia.');
        void this.router.navigateByUrl(user.role === Role.ADMINISTRATEUR ? '/admin/dashboard' : this.returnUrl);
      },
      error: () => { this.error = 'Connexion Google impossible. Vérifiez votre compte ou réessayez.'; }
    });
  }
}
