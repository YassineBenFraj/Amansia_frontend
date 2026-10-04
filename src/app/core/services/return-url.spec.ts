import { safeReturnUrl } from './return-url';

describe('safeReturnUrl', () => {
  it('conserve une route interne', () => expect(safeReturnUrl('/mon-compte?tab=profil')).toBe('/mon-compte?tab=profil'));
  it('refuse les destinations externes et les boucles auth', () => {
    expect(safeReturnUrl('//example.com')).toBe('/');
    expect(safeReturnUrl('/%2Fexample.com')).toBe('/');
    expect(safeReturnUrl('/auth/login')).toBe('/');
  });
});
