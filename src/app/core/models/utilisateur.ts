import { Role } from './role';

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  photoProfil: string | null;
  dateNaissance: string | null;
  role: Role;
  actif: boolean;
  dateCreation: string | null;
  dateModification: string | null;
}
