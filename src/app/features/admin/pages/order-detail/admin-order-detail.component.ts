import { Component,DestroyRef,inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin,finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Commande } from '../../../../core/models/commande';
import { Paiement } from '../../../../core/models/paiement';
import { CommandeService } from '../../../../core/services/commande.service';
import { AdminService } from '../../../../core/services/admin.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
@Component({selector:'app-admin-order-detail',standalone:false,templateUrl:'./admin-order-detail.component.html',styleUrl:'./admin-order-detail.component.css'})
export class AdminOrderDetailComponent{
 private readonly orders=inject(CommandeService);private readonly admin=inject(AdminService);private readonly route=inject(ActivatedRoute);private readonly destroyRef=inject(DestroyRef);
 order?:Commande;payments:Paiement[]=[];loading=true;updating=false;error='';message='';
 private readonly transitions:Record<string,string>={CONFIRMEE:'EN_PREPARATION',EN_PREPARATION:'EXPEDIEE',EXPEDIEE:'EN_LIVRAISON',EN_LIVRAISON:'LIVREE'};
 readonly progress=['EN_ATTENTE','CONFIRMEE','EN_PREPARATION','EXPEDIEE','EN_LIVRAISON','LIVREE'];
 reached(status:string):boolean{return !!this.order && this.progress.indexOf(status) <= this.progress.indexOf(this.order.statut) && this.progress.indexOf(this.order.statut) >= 0;}
 constructor(){const id=Number(this.route.snapshot.paramMap.get('id'));forkJoin({order:this.orders.detailAdmin(id),payments:this.admin.paiements()}).pipe(finalize(()=>this.loading=false),takeUntilDestroyed(this.destroyRef)).subscribe({next:r=>{this.order=r.order;this.payments=r.payments.filter(p=>p.commandeId===id);},error:e=>this.error=httpErrorMessage(e)});}
 get nextStatus():string|null{return this.order?this.transitions[this.order.statut]||null:null;}
 advance():void{if(!this.order||!this.nextStatus||this.updating)return;this.updating=true;this.error='';const next=this.nextStatus;this.orders.changerStatut(this.order.id,next).pipe(finalize(()=>this.updating=false),takeUntilDestroyed(this.destroyRef)).subscribe({next:o=>{this.order=o;this.message=`Commande passée au statut ${o.statut}.`;},error:e=>this.error=httpErrorMessage(e)});}
}
