import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {}

  async getAll(userId: string) {
    const notifications = await this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return { notifications, unreadCount };
  }

  async markRead(userId: string, id?: string) {
    if (id) {
      await this.repo.update({ id, userId }, { isRead: true });
    } else {
      await this.repo.update({ userId }, { isRead: true });
    }
    return { message: 'Marked as read' };
  }
}
