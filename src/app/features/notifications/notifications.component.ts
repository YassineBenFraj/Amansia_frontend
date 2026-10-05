import { Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({ selector: 'app-notifications', standalone: false, templateUrl: './notifications.component.html', styleUrl: './notifications.component.css' })
export class NotificationsComponent {
  readonly notifications = inject(NotificationService);
  constructor() { this.notifications.load(); }
}
