import { Produit, VarianteProduit } from './catalogue';

export interface LignePanier {
  id: number;
  produit: Produit;
  variante: VarianteProduit | null;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
}

export interface Panier {
  id: number;
  lignes: LignePanier[];
  totalGeneral: number;
}

export interface AjouterLignePanierRequest {
  produitId: number;
  varianteId?: number;
  quantite: number;
}
