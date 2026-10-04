import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { Role } from '../models/role';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';

describe('Guards', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  const protectedState = { url: '/mon-compte' } as RouterStateSnapshot;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['ensureSession', 'hasRole']);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    TestBed.configureTestingModule({ providers: [
      AuthGuard, RoleGuard,
      { provide: AuthService, useValue: auth },
      { provide: Router, useValue: router }
    ] });
  });

  it('conserve returnUrl pour une route authentifiée', async () => {
    const tree = {} as UrlTree;
    auth.ensureSession.and.returnValue(of(false));
    router.createUrlTree.and.returnValue(tree);
    expect(await firstValueFrom(TestBed.inject(AuthGuard).canActivate({} as ActivatedRouteSnapshot, protectedState))).toBe(tree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login'], { queryParams: { returnUrl: '/mon-compte' } });
  });

  it('réserve la route admin au rôle administrateur', async () => {
    const denied = {} as UrlTree;
    auth.ensureSession.and.returnValue(of(true));
    auth.hasRole.and.returnValue(false);
    router.createUrlTree.and.returnValue(denied);
    const route = { data: { roles: [Role.ADMINISTRATEUR] } } as unknown as ActivatedRouteSnapshot;
    expect(await firstValueFrom(TestBed.inject(RoleGuard).canActivate(route, { url: '/admin' } as RouterStateSnapshot))).toBe(denied);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/acces-refuse']);
  });
});
