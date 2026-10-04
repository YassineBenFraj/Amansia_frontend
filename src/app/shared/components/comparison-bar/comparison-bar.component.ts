import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ComparisonProduct } from '../../../core/models/comparison';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { ComparatorService } from '../../../core/services/comparator.service';

@Component({ selector: 'app-comparison-bar', standalone: false, templateUrl: './comparison-bar.component.html', styleUrl: './comparison-bar.component.css' })
export class ComparisonBarComponent {
  @Output() readonly collapsedChange = new EventEmitter<boolean>();
  readonly comparator = inject(ComparatorService);
  private readonly catalogue = inject(CatalogueService);
  collapsed = false;

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  image(item: ComparisonProduct): string {
    return this.catalogue.imageUrl(item.imageUrl ? { url: item.imageUrl } : null);
  }
}
