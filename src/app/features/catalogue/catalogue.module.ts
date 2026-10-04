import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { CatalogueRoutingModule } from './catalogue-routing.module';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ProductReviewsComponent } from './pages/product-reviews/product-reviews.component';

@NgModule({
  declarations: [ProductListComponent, ProductDetailComponent, ProductReviewsComponent],
  imports: [SharedModule, ReactiveFormsModule, CatalogueRoutingModule]
})
export class CatalogueModule {}
