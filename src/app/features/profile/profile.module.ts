import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';

@NgModule({ declarations: [ProfileComponent], imports: [SharedModule, ReactiveFormsModule, ProfileRoutingModule] })
export class ProfileModule {}
