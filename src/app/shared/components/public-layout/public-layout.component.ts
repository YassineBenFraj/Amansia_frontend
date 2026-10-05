import { Component, DestroyRef, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role';
import { PanierService } from '../../../core/services/panier.service';
import { FavorisService } from '../../../core/services/favoris.service';
import { ComparatorService } from '../../../core/services/comparator.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-public-layout',
  standalone: false,
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css',
})
export class PublicLayoutComponent {
  comparisonCollapsed = false;
  readonly auth = inject(AuthService);
  readonly clientRole = Role.CLIENT;
  readonly adminRole = Role.ADMINISTRATEUR;
  readonly cart = inject(PanierService);
  readonly favoris = inject(FavorisService);
  readonly comparator = inject(ComparatorService);
  readonly profile = inject(ProfileService);
  brokenPhotoUrl: string | null = null;
  private readonly destroyRef = inject(DestroyRef);
  menuOpen = false;
  profileOpen = false;

  constructor() {
    this.auth.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        if (user?.role === Role.CLIENT)
          this.cart.obtenir().subscribe({ error: () => this.cart.reset() });
        else this.cart.reset();
      });
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.profileOpen = false;
  }
  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
  }
  initials(prenom: string, nom: string): string {
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase() || 'A';
  }
  logout(): void {
    this.closeMenu();
    this.cart.reset();
    this.auth.logout();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 840) this.menuOpen = false;
  }
}
