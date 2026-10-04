export interface Adresse {
  id: number;
  adresse: string;
  ville: string;
  gouvernorat: string | null;
  codePostal: string | null;
  pays: string | null;
  adressePrincipale: boolean;
  dateCreation: string | null;
}

export interface AdresseRequest {
  adresse: string;
  ville: string;
  gouvernorat?: string;
  codePostal?: string;
  pays?: string;
  adressePrincipale?: boolean;
}
