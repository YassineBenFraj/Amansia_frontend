export interface Categorie {
  id: number;
  nom: string;
  description: string | null;
  image: string | null;
  actif: boolean;
}

export interface Produit {
  id: number;
  categorieId: number;
  categorieNom: string;
  nom: string;
  description: string | null;
  prix: number;
  prixPromotion: number | null;
  marque: string | null;
  largeur: number | null;
  hauteur: number | null;
  profondeur: number | null;
  poids: number | null;
  personnalisable: boolean;
  actif: boolean;
  disponible?: boolean;
}

export interface ProduitSuggestion {
  produit: Produit;
  imageUrl: string | null;
}

export interface ImageProduit {
  id: number;
  produitId: number;
  url: string;
  principale: boolean;
  ordre: number;
}

export interface Materiau {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean;
}

export interface Couleur {
  id: number;
  nom: string;
  codeHexadecimal: string | null;
  actif: boolean;
}

export interface VarianteProduit {
  id: number;
  produitId: number;
  materiauId: number | null;
  couleurId: number | null;
  reference: string;
  prixSupplementaire: number;
  actif: boolean;
  quantiteDisponible?: number;
}

export interface CategorieRequest {
  nom: string;
  description?: string;
  image?: string;
  actif?: boolean;
}

export interface ProduitRequest {
  categorieId: number;
  nom: string;
  description?: string;
  prix: number;
  prixPromotion?: number | null;
  marque?: string;
  largeur?: number | null;
  hauteur?: number | null;
  profondeur?: number | null;
  poids?: number | null;
  personnalisable?: boolean;
  actif?: boolean;
}
