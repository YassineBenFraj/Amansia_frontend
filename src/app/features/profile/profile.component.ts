import { Component, DestroyRef, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Utilisateur } from '../../core/models/utilisateur';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../core/services/toast.service';
import { httpErrorMessage } from '../../core/services/http-error';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  return control.get('nouveauMotDePasse')?.value === control.get('confirmation')?.value ? null : { mismatch: true };
}

@Component({ selector: 'app-profile', standalone: false, templateUrl: './profile.component.html', styleUrl: './profile.component.css' })
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly profile = inject(ProfileService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  user: Utilisateur | null = null;
  loading = true;
  saving = false;
  photoBusy = false;
  passwordBusy = false;
  googleBusy = false;
  googleLinked = false;
  googleError = '';
  error = '';
  photoError = '';
  passwordError = '';
  showPassword = false;
  previewUrl: string | null = null;
  readonly details = this.fb.nonNullable.group({
    prenom: ['', [Validators.required, Validators.maxLength(100)]],
    nom: ['', [Validators.required, Validators.maxLength(100)]],
    telephone: ['', Validators.pattern(/^(|[+0-9][0-9 ()-]{6,19})$/)]
  });
  readonly password = this.fb.nonNullable.group({
    motDePasseActuel: ['', Validators.required],
    nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: ['', Validators.required]
  }, { validators: passwordsMatch });

  constructor() {
    this.destroyRef.onDestroy(() => this.clearPreview());
    this.auth.me().pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => this.accept(user),
      error: error => this.error = httpErrorMessage(error)
    });
  }

  get avatarUrl(): string | null { return this.previewUrl || this.profile.imageUrl(this.user?.photoProfil || null); }
  get initials(): string { return `${this.user?.prenom?.[0] || ''}${this.user?.nom?.[0] || ''}`.toUpperCase() || 'A'; }

  save(): void {
    if (this.saving) return;
    this.details.markAllAsTouched();
    if (this.details.invalid) return;
    this.saving = true;
    this.error = '';
    const value = this.details.getRawValue();
    this.profile.update({ prenom: value.prenom.trim(), nom: value.nom.trim(), telephone: value.telephone.trim() })
      .pipe(finalize(() => this.saving = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: user => { this.accept(user); this.toast.success('Profil mis à jour.'); }, error: error => { this.error = httpErrorMessage(error); this.toast.error(this.error); } });
  }

  selectPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.photoBusy) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      this.photoError = 'Choisissez une image JPEG, PNG ou WebP.'; this.toast.error(this.photoError); return;
    }
    if (file.size > 3 * 1024 * 1024) {
      this.photoError = 'La photo ne doit pas dépasser 3 Mo.'; this.toast.error(this.photoError); return;
    }
    this.clearPreview();
    this.previewUrl = URL.createObjectURL(file);
    this.photoError = '';
    this.photoBusy = true;
    this.profile.upload(file).pipe(finalize(() => this.photoBusy = false), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => { this.accept(user); this.clearPreview(); this.toast.success('Photo de profil mise à jour.'); },
      error: error => { this.clearPreview(); this.photoError = httpErrorMessage(error); this.toast.error(this.photoError); }
    });
  }

  removePhoto(): void {
    if (this.photoBusy || !this.user?.photoProfil) return;
    this.photoBusy = true;
    this.photoError = '';
    this.profile.deletePhoto().pipe(finalize(() => this.photoBusy = false), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => { this.accept(user); this.toast.success('Photo supprimée.'); },
      error: error => { this.photoError = httpErrorMessage(error); this.toast.error(this.photoError); }
    });
  }

  changePassword(): void {
    if (this.passwordBusy) return;
    this.password.markAllAsTouched();
    if (this.password.invalid) return;
    this.passwordBusy = true;
    this.passwordError = '';
    this.profile.changePassword(this.password.getRawValue())
      .pipe(finalize(() => this.passwordBusy = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.password.reset(); this.toast.success('Mot de passe modifié.'); },
        error: error => { this.passwordError = httpErrorMessage(error); this.toast.error(this.passwordError); }
      });
  }

  linkGoogle(credential: string): void {
    if (this.googleBusy) return;
    this.googleBusy = true;
    this.googleError = '';
    this.auth.associerGoogle(credential)
      .pipe(finalize(() => this.googleBusy = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.googleLinked = true; this.toast.success('Compte Google associé. Vous pouvez désormais vous connecter avec Google.'); },
        error: () => { this.googleError = 'Association impossible. Choisissez un compte Google avec la même adresse email.'; }
      });
  }

  private accept(user: Utilisateur): void {
    this.auth.acceptProfile(user);
    this.user = user;
    this.details.patchValue({ prenom: user.prenom, nom: user.nom, telephone: user.telephone || '' });
  }
  private clearPreview(): void { if (this.previewUrl) URL.revokeObjectURL(this.previewUrl); this.previewUrl = null; }
}
