import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-admin-layout', standalone: false, templateUrl: './admin-layout.component.html', styleUrl: './admin-layout.component.css' })
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  menuOpen = false;
  profileOpen = false;
  get userName(): string { const user = this.auth.getCurrentUserFromSession(); return `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Administrateur'; }
  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void { this.menuOpen = false; }
  toggleProfile(): void { this.profileOpen = !this.profileOpen; }
  closeProfile(): void { this.profileOpen = false; }
  logout(): void { this.auth.logout(); }
}
