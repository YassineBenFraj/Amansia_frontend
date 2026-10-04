import { Component,DestroyRef,inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Paiement } from '../../../../core/models/paiement';
import { AdminService } from '../../../../core/services/admin.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
@Component({selector:'app-admin-payments',standalone:false,templateUrl:'./admin-payments.component.html',styleUrl:'./admin-payments.component.css'})
export class AdminPaymentsComponent{private readonly service=inject(AdminService);private readonly destroyRef=inject(DestroyRef);payments:Paiement[]=[];search='';status='';loading=true;error='';readonly statuses=['EN_ATTENTE','PAYE','ECHOUE','REMBOURSE'];constructor(){this.service.paiements().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:v=>{this.payments=v;this.loading=false;},error:e=>{this.error=httpErrorMessage(e);this.loading=false;}});}get filtered():Paiement[]{const q=this.search.trim().toLowerCase();return this.payments.filter(p=>(!this.status||p.statut===this.status)&&(!q||`${p.id} ${p.numeroCommande||p.commandeId} ${p.clientNom||''} ${p.clientEmail||''} ${p.reference||''}`.toLowerCase().includes(q)));}}
