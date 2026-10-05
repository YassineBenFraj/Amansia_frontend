import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/role';
import { Utilisateur } from '../models/utilisateur';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let session: jasmine.SpyObj<SessionService>;
  const user: Utilisateur = {
    id: 1, nom: 'Test', prenom: 'Client', email: 'client@example.test', telephone: null,
    photoProfil: null, dateNaissance: null, role: Role.CLIENT, actif: true, dateCreation: null, dateModification: null
  };

  beforeEach(() => {
    session = jasmine.createSpyObj<SessionService>('SessionService', ['getToken', 'setToken', 'setUser', 'clear', 'endSession'], { user$: of(null), user: null });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: SessionService, useValue: session }, { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }]
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('enregistre le token puis valide la session avec /auth/me', () => {
    session.getToken.and.returnValue('jwt-test');
    auth.login({ email: user.email, motDePasse: 'password' }).subscribe(result => expect(result).toEqual(user));
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({ token: 'jwt-test', type: 'Bearer', utilisateur: user });
    http.expectOne(`${environment.apiUrl}/auth/me`).flush(user);
    expect(session.setToken).toHaveBeenCalledWith('jwt-test');
    expect(session.setUser).toHaveBeenCalledWith(user, 'jwt-test');
  });
});
