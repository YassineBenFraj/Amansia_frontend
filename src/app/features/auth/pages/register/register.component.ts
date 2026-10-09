import { Component, DestroyRef, inject } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { safeReturnUrl } from '../../../../core/services/return-url';
import { ToastService } from '../../../../core/services/toast.service';
import { Role } from '../../../../core/models/role';

function notBlank(control: AbstractControl): { blank: true } | null {
  return typeof control.value === 'string' && !control.value.trim() ? { blank: true } : null;
}

@Component({ selector: 'app-register', standalone: false, templateUrl: './register.component.html', styleUrl: './register.component.css' })
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly returnUrl = safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
  readonly form = this.fb.nonNullable.group({
    nom: ['', [Validators.required, notBlank]],
    prenom: ['', [Validators.required, notBlank]],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    telephone: ['', Validators.pattern(/^[+0-9][0-9 ()-]{6,19}$/)],
    dateNaissance: ['']
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
    this.auth.register({
      nom: value.nom.trim(), prenom: value.prenom.trim(), email: value.email.trim(), motDePasse: value.motDePasse,
      ...(value.telephone ? { telephone: value.telephone.trim() } : {}),
      ...(value.dateNaissance ? { dateNaissance: value.dateNaissance } : {})
    }).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; })).subscribe({
      next: () => { this.form.controls.motDePasse.reset(); this.toast.success('Votre compte a été créé.'); void this.router.navigateByUrl(this.returnUrl); },
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
