import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Commande } from '../../../../core/models/commande';
import { CommandeService } from '../../../../core/services/commande.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { AdminService } from '../../../../core/services/admin.service';
import { Paiement } from '../../../../core/models/paiement';
import { forkJoin } from 'rxjs';
@Component({selector:'app-admin-orders',standalone:false,templateUrl:'./admin-orders.component.html',styleUrl:'./admin-orders.component.css'})
export class AdminOrdersComponent {
 private readonly service=inject(CommandeService); private readonly admin=inject(AdminService); private readonly router=inject(Router); private readonly destroyRef=inject(DestroyRef);
 orders:Commande[]=[]; payments=new Map<number,Paiement>(); search=''; status=''; date=''; loading=true; error='';
 readonly statuses=['EN_ATTENTE','CONFIRMEE','EN_PREPARATION','EXPEDIEE','EN_LIVRAISON','LIVREE','ANNULEE'];
 constructor(){this.load();}
 load():void{this.loading=true;this.error='';forkJoin({orders:this.service.toutes(),payments:this.admin.paiements()}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:v=>{this.orders=v.orders;this.payments=new Map();v.payments.forEach(p=>{const current=this.payments.get(p.commandeId);if(!current||p.statut==='PAYE')this.payments.set(p.commandeId,p);});this.loading=false;},error:()=>{this.error='Impossible de charger les commandes. Réessayez dans un instant.';this.loading=false;}});}
 get filtered():Commande[]{const q=this.search.trim().toLowerCase();return this.orders.filter(o=>(!this.status||o.statut===this.status)&&(!this.date||o.dateCommande?.slice(0,10)===this.date)&&(!q||`${o.id} ${o.numeroCommande} ${o.clientNom||''} ${o.clientEmail||''}`.toLowerCase().includes(q)));}
 paymentStatus(order:Commande):string{return this.payments.get(order.id)?.statut||'—';}
 open(order:Commande):void{void this.router.navigate(['/admin/commandes',order.id]);}
}
