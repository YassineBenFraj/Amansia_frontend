import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-field-error',
  standalone: false,
  template: '<small class="field-error" [id]="errorId" aria-live="polite">{{ message }}</small>',
  styleUrl: './field-error.component.css'
})
export class FieldErrorComponent {
  @Input({ required: true }) control!: AbstractControl;
  @Input({ required: true }) errorId = '';
  @Input() patternMessage = 'Le format est invalide.';

  get message(): string {
    if (!this.control.touched || !this.control.errors) return '';
    if (this.control.hasError('required') || this.control.hasError('blank')) return 'Ce champ est obligatoire.';
    if (this.control.hasError('email')) return 'Saisissez une adresse email valide.';
    if (this.control.hasError('minlength')) return 'Utilisez au moins 8 caractères.';
    if (this.control.hasError('pattern')) return this.patternMessage;
    return 'Vérifiez la valeur saisie.';
  }
}
