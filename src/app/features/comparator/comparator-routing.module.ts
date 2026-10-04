import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComparatorComponent } from './pages/comparator/comparator.component';

const routes: Routes = [{ path: '', component: ComparatorComponent, title: 'Comparer les meubles · Amansia' }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ComparatorRoutingModule {}
