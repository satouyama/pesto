import User from '#models/user';
import type { HttpContext } from '@adonisjs/core/http';
import Roles from '../enum/roles.js';
import string from '@adonisjs/core/helpers/string';
import {
  bulkCustomValidator,
  bulkDeleteValidator,
  customUpdateValidator,
  userProfileUpdateValidator,
  userUpdateValidator,
  userValidator,
} from '#validators/user';
import errorHandler from '#exceptions/error_handler';
import hash from '@adonisjs/core/services/hash';
import notification_service from '#services/notification_service';
import { stringify } from 'csv-stringify/sync';
import UserCreateNotification from '#mails/user_create_notification';
import mail from '@adonisjs/mail/services/main';
import useBranding from '#services/use_branding';

export default class UsersController {
  async index({ logger, request, response }: HttpContext) {
    const { page, limit, type, ...input } = request.qs();
    try {
      const dataQuery = User.filter(input)
        .if(type, (query) => {
          if (type === 'customer') return query.where('roleId', Roles.CUSTOMER);
          if (type === 'employee')
            return query.whereNotIn('roleId', [Roles.CUSTOMER, Roles.DELIVERY]);
          if (type === 'delivery') return query.where('roleId', Roles.DELIVERY);
        })
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Users Error');
    }
  }

  async exportUsers({ logger, request, response }: HttpContext) {
    const { page, limit, type = 'customer', ...input } = request.qs();
    try {
      const users = await User.filter(input)
        .if(type, (query) => {
          if (type === 'customer') return query.where('roleId', Roles.CUSTOMER);
          if (type === 'delivery') return query.where('roleId', Roles.DELIVERY);
        })
        .preload('deliveryOrders')
        .orderBy('createdAt', 'desc');

      const csvHeaders =
        type === 'customer'
          ? ['Customer Name', 'Email', 'Contact Number', 'Status']
          : ['Customer Name', 'Email', 'Contact Number', 'Total Orders', 'Status'];
      const csvRows =
        type === 'customer'
          ? users.map((user) => [
              user.fullName,
              user.email,
              user.phoneNumber,
              user.isSuspended ? false : true,
            ])
          : users.map((user) => [
              user.fullName,
              user.email,
              user.phoneNumber,
              user.deliveryOrders.length,
              user.isSuspended ? false : true,
            ]);

      const csvData = stringify([csvHeaders, ...csvRows], { header: false });
      response.header('Content-Type', 'text/csv');
      response.header(
        'Content-Disposition',
        `attachment; filename=${type === 'customer' ? 'customers.csv' : 'delivery.csv'}`
      );
      response.send(csvData);
    } catch (error) {
      errorHandler(error, response, logger, 'Export Users Error');
    }
  }

  async getById({ logger, request, response }: HttpContext) {
    try {
      const { id } = request.params();
      const user = await User.query().where('id', id).preload('role').firstOrFail();
      return response.json(user);
    } catch (error) {
      errorHandler(error, response, logger, 'Get User by Id Error');
    }
  }

  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(userValidator);
      if (![Roles.DELIVERY, Roles.CUSTOMER].includes(payload.roleId) && !payload.password?.trim()) {
        return response.badRequest({ success: false, message: 'password is a required field' });
      }
      if ([Roles.DELIVERY, Roles.CUSTOMER].includes(payload.roleId)) {
        const password = string.generateRandom(8);
        const user = await User.create({
          ...payload,
          password,
        });
        const branding = await useBranding();
        await mail.sendLater(
          new UserCreateNotification(user, password, {
            business: branding.business,
            siteUrl: branding.siteUrl || '',
          })
        );
        return response.created({
          success: true,
          message: 'User created successfully',
          content: user,
        });
      }
      const user = await User.create(payload);
      return response.created({
        success: true,
        message: 'User created successfully',
        content: user,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing User Error');
    }
  }

  async update({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const payload = await request.validateUsing(userUpdateValidator);
      const { password, ...restPayload } = payload;
      const user = await User.findOrFail(id);
      user.merge(restPayload);
      if (password) {
        user.password = password;
      }
      await user.save();
      return response.ok({
        success: true,
        message: 'User updated successfully',
        content: user,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating User Error');
    }
  }

  async updateByUser({ logger, request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(userProfileUpdateValidator);
      const { password, newPassword, ...restPayload } = payload;
      const user = await User.findOrFail(auth.user!.id);
      user.merge(restPayload);
      if (password && newPassword) {
        const verified = await hash.verify(user.password, password);
        if (!verified) {
          return response.badRequest({ success: false, message: 'Invalid old password' });
        }
        user.password = newPassword;
      }
      await user.save();
      return response.ok({
        success: true,
        message: 'Profile updated successfully',
        content: user,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating User Profile By User Error');
    }
  }

  async customUpdate({ logger, request, response, params, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const user = await User.findOrFail(params.id);
      const isSuspended = user.isSuspended;
      await user.merge(payload).save();

      if (payload.isSuspended && isSuspended !== payload.isSuspended) {
        await notification_service.sendUserSuspentionNotification(user, auth.user!);
      }
      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: user,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Fields Updating Error');
    }
  }

  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomValidator);
      const { ids, ...restPayload } = payload;
      await User.query().whereIn('id', ids).update(restPayload);
      return response.ok({ success: true, message: 'Users changes saved successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Custom Update Error');
    }
  }

  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const user = await User.findOrFail(id);
      await user.delete();
      return response.ok({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting User Error');
    }
  }

  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await User.query().whereIn('id', payload.ids).delete();
      return response.ok({ success: true, message: 'Users deleted successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Deleting Users Error');
    }
  }
}
