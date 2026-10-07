export interface Promotion {
  produitId: number;
  produitNom: string;
  prixNormal: number;
  prixPromotion: number;
  dateDebut: string | null;
  dateFin: string | null;
  actif: boolean;
  applicable: boolean;
}

export interface PromotionRequest {
  produitId: number;
  prixPromotion: number;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
}

export type TypeReduction = 'POURCENTAGE' | 'MONTANT_FIXE';

export interface CodePromo {
  id: number;
  code: string;
  typeReduction: TypeReduction;
  valeur: number;
  montantMinimum: number;
  dateDebut: string;
  dateFin: string;
  nombreUtilisationsMax: number | null;
  nombreUtilisationsParClient: number | null;
  nombreUtilisations: number;
  actif: boolean;
  dateCreation: string;
}

export interface CodePromoRequest {
  code: string;
  typeReduction: TypeReduction;
  valeur: number;
  montantMinimum: number;
  dateDebut: string;
  dateFin: string;
  nombreUtilisationsMax: number | null;
  nombreUtilisationsParClient: number | null;
  actif: boolean;
}

export interface CodePromoQuote {
  codePromoId: number | null;
  code: string | null;
  sousTotal: number;
  reduction: number;
  total: number;
}
