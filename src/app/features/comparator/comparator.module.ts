import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ComparatorRoutingModule } from './comparator-routing.module';
import { ComparatorComponent } from './pages/comparator/comparator.component';

@NgModule({ declarations: [ComparatorComponent], imports: [SharedModule, ComparatorRoutingModule] })
export class ComparatorModule {}
