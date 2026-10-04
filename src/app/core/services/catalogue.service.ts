import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categorie, CategorieRequest, Couleur, ImageProduit, Materiau, Produit, ProduitRequest, ProduitSuggestion, VarianteProduit } from '../models/catalogue';

@Injectable({ providedIn: 'root' })
export class CatalogueService {
  private readonly api = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  categories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.api}/categories/actives`);
  }

  categoriesAdmin(): Observable<Categorie[]> { return this.http.get<Categorie[]>(`${this.api}/categories`); }
  creerCategorie(request: CategorieRequest): Observable<Categorie> { return this.http.post<Categorie>(`${this.api}/categories`, request); }
  modifierCategorie(id: number, request: CategorieRequest): Observable<Categorie> { return this.http.put<Categorie>(`${this.api}/categories/${id}`, request); }
  supprimerCategorie(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/categories/${id}`); }
  uploadCategoryImage(id: number, file: File): Observable<Categorie> {
    const data = new FormData();
    data.append('file', file);
    return this.http.post<Categorie>(`${this.api}/categories/${id}/image`, data);
  }

  produits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.api}/produits`);
  }

  produitsAdmin(): Observable<Produit[]> { return this.http.get<Produit[]>(`${this.api}/produits/admin`); }
  creerProduit(request: ProduitRequest): Observable<Produit> { return this.http.post<Produit>(`${this.api}/produits`, request); }
  modifierProduit(id: number, request: ProduitRequest): Observable<Produit> { return this.http.put<Produit>(`${this.api}/produits/${id}`, request); }
  supprimerProduit(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/produits/${id}`); }

  rechercher(nom: string): Observable<Produit[]> {
    const params = new HttpParams().set('nom', nom.trim());
    return this.http.get<Produit[]>(`${this.api}/produits/recherche`, { params });
  }

  produitsParCategorie(categorieId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.api}/produits/categorie/${categorieId}/actifs`);
  }

  produit(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.api}/produits/${id}`);
  }

  similaires(id: number): Observable<ProduitSuggestion[]> {
    return this.http.get<ProduitSuggestion[]>(`${this.api}/produits/${id}/similaires`);
  }

  images(): Observable<ImageProduit[]> {
    return this.http.get<ImageProduit[]>(`${this.api}/images-produits`);
  }

  imagesProduit(id: number): Observable<ImageProduit[]> {
    return this.http.get<ImageProduit[]>(`${this.api}/images-produits/produit/${id}`);
  }

  uploadImage(produitId: number, file: File, principale = false, ordre = 0): Observable<ImageProduit> {
    const data = new FormData();
    data.append('file', file);
    data.append('produitId', String(produitId));
    data.append('principale', String(principale));
    data.append('ordre', String(ordre));
    return this.http.post<ImageProduit>(`${this.api}/images-produits/upload`, data);
  }
  supprimerImage(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/images-produits/${id}`); }
  definirImagePrincipale(id: number): Observable<ImageProduit> { return this.http.put<ImageProduit>(`${this.api}/images-produits/${id}/principale`, {}); }

  variantes(id: number): Observable<VarianteProduit[]> {
    return this.http.get<VarianteProduit[]>(`${this.api}/variantes-produits/produit/${id}/actives`);
  }

  detailsOptions(id: number): Observable<{ variantes: VarianteProduit[]; materiaux: Materiau[]; couleurs: Couleur[] }> {
    return forkJoin({
      variantes: this.variantes(id),
      materiaux: this.http.get<Materiau[]>(`${this.api}/materiaux/actifs`),
      couleurs: this.http.get<Couleur[]>(`${this.api}/couleurs/actives`)
    }).pipe(map(data => ({
      variantes: data.variantes,
      materiaux: data.materiaux.filter(item => data.variantes.some(v => v.materiauId === item.id)),
      couleurs: data.couleurs.filter(item => data.variantes.some(v => v.couleurId === item.id))
    })));
  }

  imageUrl(image: Pick<ImageProduit, 'url'> | null | undefined): string {
    if (!image?.url) return '/images/placeholder-meuble.svg';
    if (/^https?:\/\//i.test(image.url)) return image.url;
    if (image.url.startsWith('/images/')) return image.url;
    return `${environment.backendUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
  }
}
