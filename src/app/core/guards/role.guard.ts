import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Role } from '../models/role';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.auth.ensureSession().pipe(map(valid => {
      if (!valid) return this.router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
      const roles = route.data['roles'] as Role[] | undefined;
      return !!roles?.some(role => this.auth.hasRole(role)) || this.router.createUrlTree(['/acces-refuse']);
    }));
  }
}
