import { Stock } from './stock';

export type StockState = 'disponible' | 'alerte' | 'rupture';

export function stockState(stock: Pick<Stock, 'quantite' | 'seuilAlerte'>): StockState {
  return stock.quantite === 0 ? 'rupture' : stock.quantite <= stock.seuilAlerte ? 'alerte' : 'disponible';
}
