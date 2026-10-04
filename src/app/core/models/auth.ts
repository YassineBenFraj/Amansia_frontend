import { Utilisateur } from './utilisateur';

export interface AuthResponse {
  token: string;
  type: string;
  utilisateur: Utilisateur;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest extends LoginRequest {
  nom: string;
  prenom: string;
  telephone?: string;
  dateNaissance?: string;
}
