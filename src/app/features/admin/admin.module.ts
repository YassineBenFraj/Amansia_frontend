import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
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

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminDashboardComponent,
    CategoriesListComponent,
    CategoryFormComponent,
    ProductsListComponent,
    ProductFormComponent,
    ProductDetailComponent,
    AdminPlaceholderComponent,
    AdminOrdersComponent,
    AdminOrderDetailComponent,
    AdminPaymentsComponent,
    AdminUsersComponent,
    AdminUserDetailComponent,
    AdminReviewsComponent,
    AdminReviewDetailComponent,
    AdminUserFormComponent,
    AdminStocksComponent,
    AdminStockMovementsComponent,
    AdminNotificationsComponent,
  ],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, AdminRoutingModule],
})
export class AdminModule {}
