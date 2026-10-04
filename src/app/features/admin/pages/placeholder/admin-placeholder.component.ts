import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-placeholder',
  standalone: false,
  templateUrl: './admin-placeholder.component.html',
  styleUrl: './admin-placeholder.component.css',
})
export class AdminPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  get title(): string {
    return this.route.snapshot.data['title'] || 'Section';
  }
}
