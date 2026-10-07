export type MethodePaiement = 'CARTE';
export interface Paiement { id: number; commandeId: number; numeroCommande?: string; clientId?: number; clientNom?: string; clientEmail?: string; montant: number; methode: MethodePaiement; statut: string; reference: string; datePaiement?: string; dateCreation?: string; }
export interface PaiementIntent extends Paiement { clientSecret: string; publishableKey: string; }
export interface StripePreparation { clientSecret: string; publishableKey: string; sousTotal: number; remise: number; total: number; codePromo: string | null; }
