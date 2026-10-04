import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionPageComponent } from './shared/components/session-page/session-page.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { Role } from './core/models/role';
import { PublicLayoutComponent } from './shared/components/public-layout/public-layout.component';

const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(module => module.AuthModule) },
  { path: '', component: PublicLayoutComponent, children: [
    { path: '', loadChildren: () => import('./features/home/home.module').then(module => module.HomeModule) },
    { path: 'produits', loadChildren: () => import('./features/catalogue/catalogue.module').then(module => module.CatalogueModule) },
    { path: 'comparateur', loadChildren: () => import('./features/comparator/comparator.module').then(module => module.ComparatorModule) },
    { path: 'favoris', canActivate: [RoleGuard], data: { roles: [Role.CLIENT] }, loadChildren: () => import('./features/favoris/favoris.module').then(module => module.FavorisModule) },
    { path: 'checkout', canActivate: [RoleGuard], data: { roles: [Role.CLIENT] }, loadChildren: () => import('./features/checkout/checkout.module').then(module => module.CheckoutModule) },
    { path: 'adresses', canActivate: [RoleGuard], data: { roles: [Role.CLIENT] }, loadChildren: () => import('./features/addresses/addresses.module').then(module => module.AddressesModule) },
    { path: 'mes-commandes', canActivate: [RoleGuard], data: { roles: [Role.CLIENT] }, loadChildren: () => import('./features/orders/orders.module').then(module => module.OrdersModule) },
    { path: 'mon-compte', component: SessionPageComponent, canActivate: [AuthGuard], data: { page: 'account' }, title: 'Mon compte · Amansia' },
    { path: 'panier', canActivate: [RoleGuard], data: { roles: [Role.CLIENT] }, loadChildren: () => import('./features/cart/cart.module').then(module => module.CartModule) },
    { path: 'admin', canActivate: [RoleGuard], data: { roles: [Role.ADMINISTRATEUR] }, loadChildren: () => import('./features/admin/admin.module').then(module => module.AdminModule), title: 'Administration · Amansia' },
    { path: 'acces-refuse', component: SessionPageComponent, data: { page: 'forbidden' }, title: 'Accès limité · Amansia' }
  ]},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
