import { Component, DestroyRef, ViewEncapsulation, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';

interface AdminLink { label: string; path: string; icon: string; }
interface AdminGroup { label: string; links: AdminLink[]; }

@Component({ selector: 'app-admin-layout', standalone: false, templateUrl: './admin-layout.component.html', styleUrl: './admin-layout.component.css', encapsulation: ViewEncapsulation.None })
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  readonly profile = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly groups: AdminGroup[] = [
    { label: 'Vue d’ensemble', links: [{ label: 'Tableau de bord', path: '/admin/dashboard', icon: 'dashboard' }] },
    { label: 'Catalogue', links: [{ label: 'Produits', path: '/admin/produits', icon: 'products' }, { label: 'Catégories', path: '/admin/categories', icon: 'categories' }] },
    { label: 'Ventes', links: [{ label: 'Commandes', path: '/admin/commandes', icon: 'orders' }, { label: 'Paiements', path: '/admin/paiements', icon: 'payments' }] },
    { label: 'Inventaire', links: [{ label: 'Stocks', path: '/admin/stocks', icon: 'stock' }] },
    { label: 'Marketing', links: [{ label: 'Promotions', path: '/admin/promotions', icon: 'promotions' }, { label: 'Codes promo', path: '/admin/codes-promo', icon: 'codes' }] },
    { label: 'Communauté', links: [{ label: 'Utilisateurs', path: '/admin/utilisateurs', icon: 'users' }, { label: 'Avis', path: '/admin/avis', icon: 'reviews' }] },
    { label: 'Système', links: [{ label: 'Notifications', path: '/admin/notifications', icon: 'notifications' }] },
  ];
  menuOpen = false;
  profileOpen = false;
  brokenPhotoUrl = '';
  pageTitle = 'Tableau de bord';
  section = 'Vue d’ensemble';

  constructor() {
    this.updateTitle();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => { this.updateTitle(); this.closeMenu(); this.profileOpen = false; });
  }

  private updateTitle(): void {
    const path = this.router.url.split('?')[0];
    const link = this.groups.flatMap(group => group.links.map(item => ({ ...item, section: group.label })))
      .find(item => path === item.path || path.startsWith(`${item.path}/`));
    this.section = link?.section || 'Administration';
    this.pageTitle = path === '/admin/stocks/mouvements' ? 'Mouvements de stock' : link?.label || 'Tableau de bord';
  }

  initials(first?: string, last?: string): string { return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'A'; }
  closeMenu(): void { this.menuOpen = false; }
  logout(): void { this.auth.logout(); }
}
