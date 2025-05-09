import Coupon from '#models/coupon';
import {
  bulkDeleteValidator,
  bulkCustomUpdateValidator,
  couponValidator,
  customUpdateValidator,
} from '#validators/coupon';
import type { HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import Roles from '../enum/roles.js';
import errorHandler from '#exceptions/error_handler';

export default class CouponsController {
  async index({ logger, request, response }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const dataQuery = Coupon.filter(input).orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Coupons Error');
    }
  }

  async getById({ logger, request, response, auth }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await Coupon.query()
        .where('id', id)
        .if(auth.user!.roleId === Roles.CUSTOMER, (query) => {
          query.where('isAvailable', true);
        })
        .firstOrFail();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Get Coupon By Id Error');
    }
  }

  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(couponValidator);
      const data = await Coupon.create({
        name: payload.name,
        code: payload.code,
        type: payload.type,
        discountType: payload.discountType,
        discount: payload.discount,
        maxUsage: payload.maxUsage,
        minPurchase: payload.minPurchase,
        maxDiscount: payload.maxDiscount,
        validFrom: DateTime.fromISO(payload.validFrom || '')
          .startOf('day')
          .toSQL({ includeOffset: false }),
        validUntil: DateTime.fromISO(payload.validUntil || '')
          .endOf('day')
          .toSQL({ includeOffset: false }),
        isAvailable: payload.isAvailable,
      });
      return response.ok({
        success: true,
        message: 'Coupon created successfully.',
        content: data,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing coupon Error');
    }
  }

  async update({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(couponValidator);
      const coupon = await Coupon.findOrFail(params.id);
      coupon.merge({
        ...payload,
        validFrom: payload.validFrom
          ? DateTime.fromISO(payload.validFrom).startOf('day').toSQL({ includeOffset: false })
          : coupon.validFrom,
        validUntil: payload.validUntil
          ? DateTime.fromISO(payload.validUntil).endOf('day').toSQL({ includeOffset: false })
          : coupon.validUntil,
      });

      await coupon.save();
      return response.ok({
        success: true,
        message: 'Coupon updated successfully.',
        content: coupon,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Coupon Error');
    }
  }

  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const coupon = await Coupon.findOrFail(params.id);
      await coupon.merge(payload).save();

      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: coupon,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Update error');
    }
  }

  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await Coupon.query().whereIn('id', payload.ids).update(restPayload);
      return response.ok({ success: true, message: 'Coupons changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Updating Coupons Error');
    }
  }

  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const coupon = await Coupon.findOrFail(id);
      await coupon.delete();
      return response.ok({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting Coupon Error');
    }
  }

  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await Coupon.query().whereIn('id', payload.ids).delete();
      return response.ok({ success: true, message: 'Coupons deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Deleting Coupons Error');
    }
  }
}
