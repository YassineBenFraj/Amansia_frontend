import { Component, inject } from '@angular/core';
import { NotificationItem } from '../../../../core/models/notification';
import { NotificationService } from '../../../../core/services/notification.service';

type NotificationFilter = 'all' | 'unread' | 'orders' | 'stock' | 'reviews';

@Component({
  selector: 'app-admin-notifications',
  standalone: false,
  templateUrl: './admin-notifications.component.html',
  styleUrl: './admin-notifications.component.css'
})
export class AdminNotificationsComponent {
  readonly notifications = inject(NotificationService);
  filter: NotificationFilter = 'all';

  constructor() { this.notifications.load(); }

  visible(items: NotificationItem[]): NotificationItem[] {
    return items.filter(item => {
      if (this.filter === 'unread') return !item.estLue;
      if (this.filter === 'orders') return item.type === 'NOUVELLE_COMMANDE';
      if (this.filter === 'stock') return item.type === 'STOCK_FAIBLE' || item.type === 'RUPTURE_STOCK';
      if (this.filter === 'reviews') return item.type === 'NOUVEL_AVIS' || item.type === 'AVIS_MODIFIE';
      return true;
    });
  }

  trackById(_index: number, item: NotificationItem): number { return item.id; }
}
