import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';

const routes: Routes = [
  { path: '', component: ProductListComponent, title: 'Nos produits · Amansia' },
  { path: ':id', component: ProductDetailComponent, title: 'Détail produit · Amansia' }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class CatalogueRoutingModule {}
