import { Component, DestroyRef, inject } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { CommandeService } from '../../../../core/services/commande.service';
import { AdminService } from '../../../../core/services/admin.service';
import { Commande } from '../../../../core/models/commande';
import { httpErrorMessage } from '../../../../core/services/http-error';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  private readonly catalogue = inject(CatalogueService);
  private readonly commandes = inject(CommandeService);
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  loading = true;
  error = '';
  produits = 0;
  categories = 0;
  commandesCount = 0;
  utilisateurs = 0;
  recentOrders: Commande[] = [];

  constructor() {
    forkJoin({
      produits: this.catalogue.produitsAdmin(),
      categories: this.catalogue.categoriesAdmin(),
      commandes: this.commandes.toutes(),
      utilisateurs: this.admin.utilisateurs(),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          this.produits = data.produits.length;
          this.categories = data.categories.length;
          this.commandesCount = data.commandes.length;
          this.utilisateurs = data.utilisateurs.length;
          this.recentOrders = data.commandes.slice(0, 5);
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
}
