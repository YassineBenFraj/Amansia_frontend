import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Categorie, CategorieRequest } from '../../../../core/models/catalogue';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-admin-categories-list',
  standalone: false,
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.css',
})
export class CategoriesListComponent {
  private readonly catalogue = inject(CatalogueService);
  private readonly router = inject(Router);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  categories: Categorie[] = [];
  search = '';
  status = '';
  loading = true;
  error = '';
  message = '';
  constructor() {
    this.load();
  }
  get filtered(): Categorie[] {
    const query = this.search.trim().toLowerCase();
    return this.categories.filter(item => (!this.status || String(item.actif) === this.status) && (!query || `${item.nom} ${item.description || ''}`.toLowerCase().includes(query)));
  }
  load(): void {
    this.loading = true;
    this.catalogue
      .categoriesAdmin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.loading = false;
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
          this.loading = false;
        },
      });
  }
  create(): void {
    void this.router.navigate(['/admin/categories/nouveau']);
  }
  edit(category: Categorie): void {
    void this.router.navigate(['/admin/categories', category.id]);
  }
  async toggle(category: Categorie): Promise<void> {
    if (!await this.confirmation.ask(`${category.actif ? 'Désactiver' : 'Activer'} la catégorie « ${category.nom} » ?`)) return;
    const request: CategorieRequest = {
      nom: category.nom,
      description: category.description || '',
      image: category.image || '',
      actif: !category.actif,
    };
    this.catalogue
      .modifierCategorie(category.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.message = 'Statut mis à jour.';
          this.load();
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
  async remove(category: Categorie): Promise<void> {
    if (!await this.confirmation.ask(`Désactiver la catégorie « ${category.nom} » ?`, 'Désactiver')) return;
    this.catalogue
      .supprimerCategorie(category.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.message = 'Catégorie désactivée.';
          this.load();
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
}
