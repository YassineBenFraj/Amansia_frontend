export interface Avis {
  id: number;
  utilisateurId: number;
  utilisateurNom: string | null;
  produitId: number;
  produitNom: string | null;
  commandeId: number;
  note: number;
  commentaire: string | null;
  approuve: boolean;
  dateCreation: string;
}

export interface AvisCreationRequest {
  produitId: number;
  commandeId: number;
  note: number;
  commentaire?: string;
}

export interface AvisUpdateRequest {
  note: number;
  commentaire?: string;
}
