import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Connexion · Amansia' },
  { path: 'register', component: RegisterComponent, title: 'Inscription · Amansia' },
  { path: 'mot-de-passe-oublie', component: ForgotPasswordComponent, title: 'Mot de passe oublié · Amansia' },
  { path: 'reinitialiser-mot-de-passe', component: ResetPasswordComponent, title: 'Réinitialiser le mot de passe · Amansia' },
  { path: '', pathMatch: 'full', redirectTo: 'login' }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AuthRoutingModule {}
