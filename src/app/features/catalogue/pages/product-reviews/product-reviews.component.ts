import { Component, DestroyRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Avis } from '../../../../core/models/avis';
import { Commande } from '../../../../core/models/commande';
import { AvisService } from '../../../../core/services/avis.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CommandeService } from '../../../../core/services/commande.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { Role } from '../../../../core/models/role';

@Component({
  selector: 'app-product-reviews',
  standalone: false,
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.css'
})
export class ProductReviewsComponent implements OnChanges {
  @Input() productId = 0;

  private readonly avisService = inject(AvisService);
  private readonly auth = inject(AuthService);
  private readonly commandesService = inject(CommandeService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly stars = [1, 2, 3, 4, 5];
  readonly form = this.fb.nonNullable.group({
    note: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    commentaire: ['', [Validators.maxLength(1000)]]
  });
  avis: Avis[] = [];
  commandesEligibles: Commande[] = [];
  avisPersonnel?: Avis;
  editingId: number | null = null;
  loading = true;
  saving = false;
  deletingId: number | null = null;
  error = '';
  message = '';

  get canReview(): boolean { return this.auth.hasRole(Role.CLIENT); }
  get currentUserId(): number | null { return this.auth.getCurrentUserFromSession()?.id ?? null; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId']?.currentValue > 0) this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = '';
    const commandes$ = this.canReview ? this.commandesService.mesCommandes() : of([] as Commande[]);
    forkJoin({
      avis: this.avisService.listerPourProduit(this.productId),
      commandes: commandes$.pipe(catchError(() => of([] as Commande[])))
    }).pipe(finalize(() => { this.loading = false; }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ avis, commandes }) => {
        this.avis = avis;
        this.commandesEligibles = commandes.filter(commande =>
          commande.lignes?.some(ligne => ligne.produitId === this.productId)
        );
        this.avisPersonnel = avis.find(item => item.utilisateurId === this.currentUserId);
      },
      error: error => { this.error = httpErrorMessage(error); }
    });
  }

  isOwner(avis: Avis): boolean { return avis.utilisateurId === this.currentUserId; }
  starLabel(note: number): string { return `${note}/5`; }
  selectNote(note: number): void { this.form.controls.note.setValue(note); this.form.controls.note.markAsDirty(); }

  startEdit(avis: Avis): void {
    this.editingId = avis.id;
    this.message = '';
    this.error = '';
    this.form.setValue({ note: avis.note, commentaire: avis.commentaire || '' });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form.reset({ note: 5, commentaire: '' });
  }

  submit(): void {
    if (this.form.invalid || this.saving || !this.productId) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.editingId && !this.commandesEligibles.length) return;
    this.saving = true;
    this.error = '';
    this.message = '';
    const value = {
      note: this.form.controls.note.value,
      commentaire: this.form.controls.commentaire.value.trim() || undefined
    };
    const request$ = this.editingId
      ? this.avisService.modifier(this.editingId, value)
      : this.avisService.creer({ ...value, produitId: this.productId, commandeId: this.commandesEligibles[0].id });
    request$.pipe(finalize(() => { this.saving = false; }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: avis => {
        this.avisPersonnel = avis;
        this.editingId = null;
        this.form.reset({ note: 5, commentaire: '' });
        this.avis = avis.approuve ? [avis, ...this.avis.filter(item => item.id !== avis.id)] : this.avis.filter(item => item.id !== avis.id);
        this.message = avis.approuve ? 'Votre avis est publié.' : 'Votre avis a été envoyé pour modération.';
      },
      error: error => { this.error = httpErrorMessage(error); }
    });
  }

  remove(avis: Avis): void {
    if (this.deletingId || !this.isOwner(avis)) return;
    this.deletingId = avis.id;
    this.error = '';
    this.avisService.supprimer(avis.id).pipe(finalize(() => { this.deletingId = null; }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.avis = this.avis.filter(item => item.id !== avis.id);
        if (this.avisPersonnel?.id === avis.id) this.avisPersonnel = undefined;
        if (this.editingId === avis.id) this.cancelEdit();
        this.message = 'Votre avis a été supprimé.';
      },
      error: error => { this.error = httpErrorMessage(error); }
    });
  }
}
