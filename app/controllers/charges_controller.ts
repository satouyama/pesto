import Charge from '#models/charge';
import {
  bulkDeleteValidator,
  bulkCustomUpdateValidator,
  chargeValidator,
  customUpdateValidator,
} from '#validators/charge';
import type { HttpContext } from '@adonisjs/core/http';
import Roles from '../enum/roles.js';
import errorHandler from '#exceptions/error_handler';

export default class ChargesController {
  async index({ logger, request, response, auth }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const dataQuery = Charge.filter(input)
        .if(auth.user!.roleId === Roles.CUSTOMER, (query) => {
          query.where('isAvailable', true);
        })
        .preload('menuItems')
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Charges Error');
    }
  }

  async getById({ logger, request, response, auth }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await Charge.query()
        .if(auth.user!.roleId === Roles.CUSTOMER, (query) => {
          query.where('isAvailable', true);
        })
        .where('id', id)
        .preload('menuItems')
        .firstOrFail();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Get By Id Error');
    }
  }

  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(chargeValidator);
      const charge = await Charge.create(payload);

      return response.created({
        success: true,
        message: 'Charge created successfully',
        content: charge,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing charge Error');
    }
  }

  async update({ logger, request, response, params }: HttpContext) {
    try {
      const charge = await Charge.findOrFail(params.id);
      const payload = await request.validateUsing(chargeValidator);
      await charge.merge(payload).save();

      return response.ok({
        success: true,
        message: 'Charge updated successfully',
        content: charge,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating charge Error');
    }
  }

  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const charges = await Charge.findOrFail(params.id);
      await charges.merge(payload).save();

      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: charges,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Update error');
    }
  }

  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await Charge.query().whereIn('id', ids).update(restPayload);

      return response.ok({ success: true, message: 'Charges changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk custom update error');
    }
  }

  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await Charge.findOrFail(id);
      await data.delete();
      return response.json({ success: true, message: 'Charge deleted successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting error');
    }
  }

  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await Charge.query().whereIn('id', payload.ids).delete();

      return response.ok({ success: true, message: 'Charges deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Deleting error');
    }
  }
}
