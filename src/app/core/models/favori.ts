export interface Favori {
  id: number;
  produitId: number;
  nom: string;
  prix: number;
  prixPromotion: number | null;
  imageUrl: string | null;
  actif: boolean;
  dateCreation: string;
}
