import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Categorie, CategorieRequest } from '../../../../core/models/catalogue';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-category-form',
  standalone: false,
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css',
})
export class CategoryFormComponent {
  private readonly catalogue = inject(CatalogueService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', Validators.maxLength(1000)],
  });
  category?: Categorie;
  editing = false;
  loading = false;
  saving = false;
  error = '';
  message = '';
  selectedFile?: File;
  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.editing = true;
      this.load(id);
    }
  }
  load(id: number): void {
    this.loading = true;
    this.catalogue
      .categoriesAdmin()
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (categories) => {
          this.category = categories.find((item) => item.id === id);
          if (!this.category) {
            this.error = 'Catégorie introuvable.';
            return;
          }
          this.form.setValue({
            nom: this.category.nom,
            description: this.category.description || '',
          });
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
  chooseFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0];
  }
  imageUrl(): string {
    const image = this.category?.image;
    return image
      ? `${environment.backendUrl}${image.startsWith('/') ? '' : '/'}${image}`
      : '';
  }
  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    const request: CategorieRequest = {
      ...this.form.getRawValue(),
      ...(this.editing ? { image: this.category?.image || '' } : {}),
    };
    const call$ = this.editing
      ? this.catalogue.modifierCategorie(this.category!.id, request)
      : this.catalogue.creerCategorie(request);
    call$
      .pipe(
        switchMap((category) =>
          this.selectedFile
            ? this.catalogue.uploadCategoryImage(category.id, this.selectedFile)
            : of(category),
        ),
        finalize(() => {
          this.saving = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.message = this.editing
            ? 'Catégorie modifiée.'
            : 'Catégorie créée.';
          void this.router.navigate(['/admin/categories']);
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
  back(): void {
    void this.router.navigate(['/admin/categories']);
  }
}
