import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { Role } from '../../core/models/role';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { CategoriesListComponent } from './pages/categories-list/categories-list.component';
import { CategoryFormComponent } from './pages/category-form/category-form.component';
import { ProductsListComponent } from './pages/products-list/products-list.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { AdminPlaceholderComponent } from './pages/placeholder/admin-placeholder.component';
import { AdminOrdersComponent } from './pages/orders/admin-orders.component';
import { AdminOrderDetailComponent } from './pages/order-detail/admin-order-detail.component';
import { AdminPaymentsComponent } from './pages/payments/admin-payments.component';
import { AdminUsersComponent } from './pages/users/admin-users.component';
import { AdminUserDetailComponent } from './pages/user-detail/admin-user-detail.component';
import { AdminReviewsComponent } from './pages/reviews/admin-reviews.component';
import { AdminReviewDetailComponent } from './pages/review-detail/admin-review-detail.component';
import { AdminUserFormComponent } from './pages/user-form/admin-user-form.component';
import { AdminStocksComponent } from './pages/stocks/admin-stocks.component';
import { AdminStockMovementsComponent } from './pages/stock-movements/admin-stock-movements.component';
import { AdminNotificationsComponent } from './pages/notifications/admin-notifications.component';
import { AdminPromotionsComponent } from './pages/promotions/admin-promotions.component';
import { AdminCodesPromoComponent } from './pages/codes-promo/admin-codes-promo.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: [Role.ADMINISTRATEUR] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'notifications', component: AdminNotificationsComponent },
      { path: 'promotions', component: AdminPromotionsComponent },
      { path: 'codes-promo', component: AdminCodesPromoComponent },
      { path: 'categories', component: CategoriesListComponent },
      { path: 'categories/nouveau', component: CategoryFormComponent },
      { path: 'categories/:id', component: CategoryFormComponent },
      { path: 'produits', component: ProductsListComponent },
      { path: 'produits/nouveau', component: ProductFormComponent },
      { path: 'produits/:id/consulter', component: ProductDetailComponent },
      { path: 'produits/:id', component: ProductFormComponent },
      { path: 'stocks', component: AdminStocksComponent },
      { path: 'stocks/mouvements', component: AdminStockMovementsComponent },
      { path: 'commandes', component: AdminOrdersComponent },
      { path: 'commandes/:id', component: AdminOrderDetailComponent },
      { path: 'paiements', component: AdminPaymentsComponent },
      { path: 'utilisateurs', component: AdminUsersComponent },
      { path: 'utilisateurs/nouveau', component: AdminUserFormComponent },
      { path: 'utilisateurs/:id/modifier', component: AdminUserFormComponent },
      { path: 'utilisateurs/:id', component: AdminUserDetailComponent },
      { path: 'avis', component: AdminReviewsComponent },
      { path: 'avis/:id', component: AdminReviewDetailComponent },
    ],
  },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AdminRoutingModule {}
