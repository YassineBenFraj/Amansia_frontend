import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Role } from '../../../../core/models/role';
import { Utilisateur } from '../../../../core/models/utilisateur';
import { AdminService } from '../../../../core/services/admin.service';
import { SessionService } from '../../../../core/services/session.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ProfileService } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent {
  private readonly admin = inject(AdminService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmation = inject(ConfirmationService);
  readonly profile = inject(ProfileService);
  users: Utilisateur[] = [];
  search = '';
  role = '';
  status = '';
  loading = true;
  updatingId: number | null = null;
  error = '';
  message = '';
  readonly roles = Object.values(Role);
  initials(user: Utilisateur): string { return `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() || 'U'; }

  constructor() {
    this.load();
  }

  get currentUserId(): number | undefined {
    return this.session.user?.id;
  }
  get filtered(): Utilisateur[] {
    const query = this.search.trim().toLowerCase();
    return this.users.filter(
      (user) =>
        (!this.role || user.role === this.role) &&
        (!this.status || String(user.actif) === this.status) &&
        (!query ||
          `${user.id} ${user.nom} ${user.prenom} ${user.email}`
            .toLowerCase()
            .includes(query)),
    );
  }

  open(user: Utilisateur): void {
    void this.router.navigate(['/admin/utilisateurs', user.id]);
  }
  create(): void {
    void this.router.navigate(['/admin/utilisateurs/nouveau']);
  }
  edit(user: Utilisateur): void {
    void this.router.navigate(['/admin/utilisateurs', user.id, 'modifier']);
  }

  async remove(user: Utilisateur): Promise<void> {
    if (user.id === this.currentUserId) {
      this.error = 'Vous ne pouvez pas supprimer votre propre compte.';
      return;
    }
    if (!await this.confirmation.ask(`Supprimer définitivement le compte de ${user.prenom} ${user.nom} ?`, 'Supprimer')) return;
    this.updatingId = user.id;
    this.error = '';
    this.message = '';
    this.admin
      .supprimerUtilisateur(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.users = this.users.filter((item) => item.id !== user.id);
          this.message = 'Utilisateur supprimé.';
          this.updatingId = null;
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
          this.updatingId = null;
        },
      });
  }

  toggle(user: Utilisateur): void {
    if (user.id === this.currentUserId && user.actif) {
      this.error = 'Vous ne pouvez pas désactiver votre propre compte.';
      return;
    }
    this.updatingId = user.id;
    this.error = '';
    this.message = '';
    this.admin
      .changerStatutUtilisateur(user.id, !user.actif)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.users = this.users.map((item) =>
            item.id === updated.id ? updated : item,
          );
          this.message = updated.actif
            ? 'Utilisateur activé.'
            : 'Utilisateur désactivé.';
          this.updatingId = null;
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
          this.updatingId = null;
        },
      });
  }

  private load(): void {
    this.admin
      .utilisateurs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.loading = false;
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
          this.loading = false;
        },
      });
  }
}
