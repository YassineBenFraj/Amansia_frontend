import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';

const routes: Routes = [{ path: '', component: HomeComponent, title: 'Amansia · Mobilier et art de vivre' }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class HomeRoutingModule {}
