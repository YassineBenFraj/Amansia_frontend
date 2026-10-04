import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './pages/orders/orders.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { OrderProgressComponent } from './components/order-progress/order-progress.component';

@NgModule({ declarations: [OrdersComponent, OrderDetailComponent, OrderProgressComponent], imports: [SharedModule, OrdersRoutingModule] })
export class OrdersModule {}
