import errorHandler from '#exceptions/error_handler';
import Notification from '#models/notification';
import type { HttpContext } from '@adonisjs/core/http';

export default class NotificationsController {
  async index({ logger, request, response, auth }: HttpContext) {
    try {
      const { page, limit } = request.qs();
      const data = await Notification.query()
        .where('userId', auth.user!.id)
        .orderBy('createdAt', 'desc')
        .paginate(page, limit);
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Notification Error');
    }
  }

  async getById({ logger, request, response, auth }: HttpContext) {
    try {
      const { id } = request.params();
      const data = await Notification.query()
        .where('id', id)
        .andWhere('userId', auth.user!.id)
        .firstOrFail();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'GetById Notification Error');
    }
  }

  async unreadCount({ logger, response, auth }: HttpContext) {
    try {
      const count = await Notification.query()
        .where('userId', auth.user!.id)
        .andWhere('isRead', false)
        .count('* as total');

      return response.json({ total: count[0].$extras.total });
    } catch (error) {
      errorHandler(error, response, logger, ' Unread Count Notification Error');
    }
  }

  async markAsRead({ logger, request, response, auth }: HttpContext) {
    try {
      const { id } = request.params();
      const data = await Notification.query()
        .where('id', id)
        .andWhere('userId', auth.user!.id)
        .firstOrFail();
      data.isRead = true;
      await data.save();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'MarkAsRead Notification Error');
    }
  }

  async markAllAsRead({ logger, response, auth }: HttpContext) {
    try {
      await Notification.query().where('userId', auth.user!.id).update({ isRead: true });
      return response.json({ message: 'All notifications marked as read' });
    } catch (error) {
      errorHandler(error, response, logger, 'MarkAllAsRead Notification Error');
    }
  }
}
