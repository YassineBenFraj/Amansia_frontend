import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AddressesRoutingModule } from './addresses-routing.module';
import { AddressesComponent } from './addresses.component';
@NgModule({ declarations: [AddressesComponent], imports: [SharedModule, ReactiveFormsModule, AddressesRoutingModule], exports: [AddressesComponent] })
export class AddressesModule {}
