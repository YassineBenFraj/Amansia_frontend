export interface Commande {
  id: number;
  utilisateurId: number;
  clientNom?: string;
  clientEmail?: string;
  clientTelephone?: string;
  adresseLivraisonId: number;
  adresseLivraison?: string;
  villeLivraison?: string;
  codePostalLivraison?: string;
  paysLivraison?: string;
  numeroCommande: string;
  dateCommande: string;
  statut: string;
  sousTotal: number;
  sousTotalAvantPromotion?: number;
  fraisLivraison?: number;
  remise: number;
  remiseProduits?: number;
  codePromo?: string | null;
  total: number;
  commentaire: string | null;
  lignes: LigneCommande[];
}

export interface LigneCommande {
  id: number;
  produitId: number;
  produitNom?: string;
  varianteId: number | null;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
}

export interface CommandeRequest {
  adresseLivraisonId: number;
  commentaire?: string;
}
