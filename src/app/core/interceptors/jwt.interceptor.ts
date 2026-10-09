import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../services/session.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private readonly session: SessionService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const api = new URL(environment.apiUrl);
    const url = new URL(request.url, window.location.origin);
    const isApi = url.origin === api.origin && (url.pathname === api.pathname || url.pathname.startsWith(`${api.pathname}/`));
    const isLogin = [`${api.pathname}/auth/login`, `${api.pathname}/auth/register`, `${api.pathname}/auth/google`].includes(url.pathname);
    const token = isApi && !isLogin ? this.session.getToken() : null;
    const authenticated = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
    return next.handle(authenticated).pipe(catchError((error: unknown) => {
      if (isApi && !isLogin && token && error instanceof HttpErrorResponse && error.status === 401) {
        this.session.endSession(token);
      }
      return throwError(() => error);
    }));
  }
}
