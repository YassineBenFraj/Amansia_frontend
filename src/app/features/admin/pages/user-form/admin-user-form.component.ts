import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Role } from '../../../../core/models/role';
import { AdminService, UtilisateurAdminRequest } from '../../../../core/services/admin.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { SessionService } from '../../../../core/services/session.service';

@Component({ selector: 'app-admin-user-form', standalone: false, templateUrl: './admin-user-form.component.html', styleUrl: './admin-user-form.component.css' })
export class AdminUserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly session = inject(SessionService);
  readonly id = Number(this.route.snapshot.paramMap.get('id')) || null;
  readonly roles = Object.values(Role);
  loading = !!this.id;
  submitting = false;
  error = '';
  readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.minLength(8)],
    telephone: [''],
    dateNaissance: [''],
    role: [Role.CLIENT, Validators.required],
    actif: [true]
  });

  constructor() {
    if (!this.id) {
      this.form.controls.motDePasse.addValidators(Validators.required);
      return;
    }
    this.admin.utilisateur(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => {
        this.form.patchValue({
          nom: user.nom, prenom: user.prenom, email: user.email,
          telephone: user.telephone || '', dateNaissance: user.dateNaissance || '',
          role: user.role, actif: user.actif
        });
        if (user.id === this.session.user?.id) {
          this.form.controls.role.disable();
          this.form.controls.actif.disable();
        }
        this.loading = false;
      },
      error: error => { this.error = httpErrorMessage(error); this.loading = false; }
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    this.error = '';
    const value = this.form.getRawValue();
    const request: UtilisateurAdminRequest = {
      nom: value.nom.trim(), prenom: value.prenom.trim(), email: value.email.trim(),
      telephone: value.telephone.trim(), dateNaissance: value.dateNaissance || undefined,
      role: value.role, actif: value.actif,
      ...(value.motDePasse ? { motDePasse: value.motDePasse } : {})
    };
    const operation = this.id
      ? this.admin.modifierUtilisateur(this.id, request)
      : this.admin.creerUtilisateur({ ...request, motDePasse: value.motDePasse });
    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => void this.router.navigate(['/admin/utilisateurs', user.id]),
      error: error => { this.error = httpErrorMessage(error); this.submitting = false; }
    });
  }
}
