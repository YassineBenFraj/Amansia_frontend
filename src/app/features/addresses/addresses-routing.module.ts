import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddressesComponent } from './addresses.component';
const routes: Routes = [{ path: '', component: AddressesComponent, title: 'Mes adresses · Amansia' }];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AddressesRoutingModule {}
