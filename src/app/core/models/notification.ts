export type NotificationType = 'PAIEMENT_CONFIRME' | 'COMMANDE_CONFIRMEE' | 'COMMANDE_STATUT' | 'COMMANDE_ANNULEE' |
  'STOCK_DISPONIBLE' | 'NOUVELLE_COMMANDE' | 'STOCK_FAIBLE' | 'RUPTURE_STOCK' | 'NOUVEL_AVIS' | 'AVIS_MODIFIE';

export interface NotificationItem {
  id: number;
  type: NotificationType;
  titre: string;
  message: string;
  lien: string | null;
  estLue: boolean;
  dateCreation: string;
}
