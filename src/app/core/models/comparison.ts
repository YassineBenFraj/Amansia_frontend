import { Produit } from './catalogue';

export interface ComparisonProduct {
  produit: Produit;
  imageUrl: string | null;
}

export type ComparisonAction = 'added' | 'removed' | 'already' | 'full';
