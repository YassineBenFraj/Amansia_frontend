import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FavorisRoutingModule } from './favoris-routing.module';
import { FavorisComponent } from './favoris.component';

@NgModule({ declarations: [FavorisComponent], imports: [SharedModule, FavorisRoutingModule] })
export class FavorisModule {}
