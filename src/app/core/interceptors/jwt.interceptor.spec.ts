import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SessionService } from '../services/session.service';
import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let session: jasmine.SpyObj<SessionService>;

  beforeEach(() => {
    session = jasmine.createSpyObj<SessionService>('SessionService', ['getToken', 'endSession']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: {} },
        { provide: SessionService, useValue: session },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
      ]
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('ajoute le Bearer uniquement à l’API Amansia', () => {
    session.getToken.and.returnValue('jwt-test');
    http.get(`${environment.apiUrl}/auth/me`).subscribe();
    expect(controller.expectOne(`${environment.apiUrl}/auth/me`).request.headers.get('Authorization')).toBe('Bearer jwt-test');
    http.get('https://example.com/data').subscribe();
    expect(controller.expectOne('https://example.com/data').request.headers.has('Authorization')).toBeFalse();
  });

  it('nettoie un 401 mais conserve la session sur 403', () => {
    session.getToken.and.returnValue('jwt-test');
    http.get(`${environment.apiUrl}/auth/me`).subscribe({ error: () => undefined });
    controller.expectOne(`${environment.apiUrl}/auth/me`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(session.endSession).toHaveBeenCalledWith('jwt-test');
    session.endSession.calls.reset();
    http.get(`${environment.apiUrl}/admin`).subscribe({ error: () => undefined });
    controller.expectOne(`${environment.apiUrl}/admin`).flush({}, { status: 403, statusText: 'Forbidden' });
    expect(session.endSession).not.toHaveBeenCalled();
  });
});
