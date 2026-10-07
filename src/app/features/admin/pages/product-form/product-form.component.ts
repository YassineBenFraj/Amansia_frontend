import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Categorie,
  ImageProduit,
  Produit,
  ProduitRequest,
} from '../../../../core/models/catalogue';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-admin-product-form',
  standalone: false,
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent {
  private readonly catalogue = inject(CatalogueService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  readonly form = this.fb.nonNullable.group({
    categorieId: [0, Validators.required],
    nom: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    prix: [0, [Validators.required, Validators.min(0.01)]],
    marque: [''],
    largeur: [null as number | null],
    hauteur: [null as number | null],
    profondeur: [null as number | null],
    poids: [null as number | null],
    personnalisable: [false],
  });
  categories: Categorie[] = [];
  product?: Produit;
  images: ImageProduit[] = [];
  editing = false;
  loading = true;
  saving = false;
  uploading = false;
  error = '';
  message = '';
  constructor() {
    this.catalogue
      .categoriesAdmin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories = categories.filter((item) => item.actif);
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.editing = true;
      this.load(id);
    } else this.loading = false;
  }
  load(id: number): void {
    this.loading = true;
    this.catalogue
      .produit(id)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (product) => {
          this.product = product;
          this.form.setValue({
            categorieId: product.categorieId,
            nom: product.nom,
            description: product.description || '',
            prix: product.prix,
            marque: product.marque || '',
            largeur: product.largeur,
            hauteur: product.hauteur,
            profondeur: product.profondeur,
            poids: product.poids,
            personnalisable: product.personnalisable,
          });
          this.loadImages(id);
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const raw = this.form.getRawValue();
    const request: ProduitRequest = {
      ...raw,
    };
    const call$ = this.editing
      ? this.catalogue.modifierProduit(this.product!.id, request)
      : this.catalogue.creerProduit(request);
    call$
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.message = this.editing ? 'Produit modifié.' : 'Produit créé.';
          void this.router.navigate(['/admin/produits']);
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
  back(): void {
    void this.router.navigate(['/admin/produits']);
  }
  loadImages(id: number): void {
    this.catalogue
      .imagesProduit(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (images) => {
          this.images = images;
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
  upload(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file || !this.product) return;
    this.uploading = true;
    this.catalogue
      .uploadImage(
        this.product.id,
        file,
        !this.images.length,
        this.images.length,
      )
      .pipe(
        finalize(() => {
          this.uploading = false;
          input.value = '';
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.message = 'Image ajoutée.';
          this.loadImages(this.product!.id);
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
  async deleteImage(image: ImageProduit): Promise<void> {
    if (!await this.confirmation.ask('Supprimer cette image ?', 'Supprimer')) return;
    this.catalogue
      .supprimerImage(image.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.message = 'Image supprimée.';
          this.loadImages(this.product!.id);
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
  setMainImage(image: ImageProduit): void {
    this.catalogue
      .definirImagePrincipale(image.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.message = 'Image principale mise à jour.';
          this.loadImages(this.product!.id);
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
  imageUrl(image: ImageProduit): string {
    return this.catalogue.imageUrl(image);
  }
}
