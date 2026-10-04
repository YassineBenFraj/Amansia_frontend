import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Commande } from '../../../../core/models/commande';
import { CommandeService } from '../../../../core/services/commande.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
@Component({selector:'app-admin-orders',standalone:false,templateUrl:'./admin-orders.component.html',styleUrl:'./admin-orders.component.css'})
export class AdminOrdersComponent {
 private readonly service=inject(CommandeService); private readonly router=inject(Router); private readonly destroyRef=inject(DestroyRef);
 orders:Commande[]=[]; search=''; status=''; loading=true; error='';
 readonly statuses=['EN_ATTENTE','CONFIRMEE','EN_PREPARATION','EXPEDIEE','EN_LIVRAISON','LIVREE','ANNULEE'];
 constructor(){this.service.toutes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:v=>{this.orders=v;this.loading=false;},error:e=>{this.error=httpErrorMessage(e);this.loading=false;}});}
 get filtered():Commande[]{const q=this.search.trim().toLowerCase();return this.orders.filter(o=>(!this.status||o.statut===this.status)&&(!q||`${o.id} ${o.numeroCommande} ${o.clientNom||''} ${o.clientEmail||''}`.toLowerCase().includes(q)));}
 open(order:Commande):void{void this.router.navigate(['/admin/commandes',order.id]);}
}
