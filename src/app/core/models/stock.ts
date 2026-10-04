export interface Stock {
  varianteId: number;
  reference: string;
  produitId: number;
  produitNom: string;
  couleur: string | null;
  materiau: string | null;
  quantite: number;
  seuilAlerte: number;
  dateMiseAJour: string | null;
}

export interface MouvementStock {
  id: number;
  varianteId: number;
  produitNom: string;
  referenceVariante: string;
  typeMouvement: 'ENTREE' | 'SORTIE' | 'RETOUR' | 'AJUSTEMENT';
  quantite: number;
  motif: string | null;
  reference: string | null;
  dateMouvement: string;
}

export interface MouvementStockRequest {
  varianteId: number;
  typeMouvement: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT';
  quantite: number;
  motif: string;
}
