import { Component, DestroyRef, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from '../../../core/services/confirmation.service';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: false,
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent {
  readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('cancelButton') cancelButton?: ElementRef<HTMLButtonElement>;

  constructor() {
    this.confirmation.request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(request => {
      if (request) setTimeout(() => this.cancelButton?.nativeElement.focus(), 0);
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.confirmation.answer(false); }
}
