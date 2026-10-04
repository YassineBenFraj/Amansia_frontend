import { NgModule } from '@angular/core'; import { RouterModule, Routes } from '@angular/router'; import { OrdersComponent } from './pages/orders/orders.component'; import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
const routes: Routes = [{ path:'', component:OrdersComponent, title:'Mes commandes · Amansia' }, { path:':id', component:OrderDetailComponent, title:'Détail commande · Amansia' }];
@NgModule({imports:[RouterModule.forChild(routes)],exports:[RouterModule]}) export class OrdersRoutingModule {}
