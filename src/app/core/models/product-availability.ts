import { Stock } from './stock';

export type ProductAvailability = 'disponible' | 'rupture' | 'sans-variante';

export function productAvailability(stocks: Pick<Stock, 'quantite'>[]): ProductAvailability {
  if (!stocks.length) return 'sans-variante';
  return stocks.some(stock => stock.quantite > 0) ? 'disponible' : 'rupture';
}
