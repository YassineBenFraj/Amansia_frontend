import { Component, Input, inject } from '@angular/core';
import { NotificationItem } from '../../../core/models/notification';
import { NotificationService } from '../../../core/services/notification.service';

@Component({ selector: 'app-notification-bell', standalone: false, templateUrl: './notification-bell.component.html', styleUrl: './notification-bell.component.css' })
export class NotificationBellComponent {
  @Input() admin = false;
  readonly notifications = inject(NotificationService);
  open = false;
  toggle(): void { this.open = !this.open; if (this.open) this.notifications.load(); }
  select(item: NotificationItem): void { this.open = false; this.notifications.open(item); }
}
