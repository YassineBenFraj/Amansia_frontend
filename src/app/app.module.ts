import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { SessionPageComponent } from './shared/components/session-page/session-page.component';
import { AuthService } from './core/services/auth.service';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

registerLocaleData(localeFr);

export function restoreSession(auth: AuthService): () => Promise<void> {
  return () => auth.restoreSession();
}

@NgModule({
  declarations: [
    AppComponent, SessionPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, HttpClientModule, SharedModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: APP_INITIALIZER, useFactory: restoreSession, deps: [AuthService], multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
