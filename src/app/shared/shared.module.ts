import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FieldErrorComponent } from './components/field-error/field-error.component';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { TndPipe } from './pipes/tnd.pipe';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { ImageFallbackDirective } from './directives/image-fallback.directive';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ProductShelfComponent } from './components/product-shelf/product-shelf.component';
import { RecentlyViewedComponent } from './components/recently-viewed/recently-viewed.component';
import { ComparisonBarComponent } from './components/comparison-bar/comparison-bar.component';



@NgModule({
  declarations: [FieldErrorComponent, PublicLayoutComponent, TndPipe, ToastContainerComponent, ImageFallbackDirective, ConfirmationDialogComponent, ProductShelfComponent, RecentlyViewedComponent, ComparisonBarComponent],
  imports: [
    CommonModule, RouterModule
  ],
  exports: [CommonModule, RouterModule, FieldErrorComponent, PublicLayoutComponent, TndPipe, ToastContainerComponent, ImageFallbackDirective, ConfirmationDialogComponent, ProductShelfComponent, RecentlyViewedComponent, ComparisonBarComponent]
})
export class SharedModule { }
