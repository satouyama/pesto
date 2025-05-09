import Addon from '#models/addon';
import {
  addonValidator,
  bulkDeleteValidator,
  customUpdateValidator,
  bulkCustomUpdateValidator,
} from '#validators/addon';
import type { HttpContext } from '@adonisjs/core/http';
import errorHandler from '#exceptions/error_handler';
import Roles from '../enum/roles.js';
import { attachmentManager } from '@jrmc/adonis-attachment';

export default class AddonsController {
  async index({ logger, request, response, auth }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const dataQuery = Addon.filter(input)
        .if(auth.user!.roleId === Roles.CUSTOMER, (query) => {
          query.where('isAvailable', true);
        })
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Error');
    }
  }

  async getById({ logger, request, response, auth }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await Addon.query()
        .if(auth.user!.roleId === Roles.CUSTOMER, (query) => {
          query.where('isAvailable', true);
        })
        .where('id', id)
        .firstOrFail();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Get By Id Error');
    }
  }

  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(addonValidator);
      const { image, ...restPayload } = payload;
      const processedImage = image ? await attachmentManager.createFromFile(image) : null;
      const addon = await Addon.create({ image: processedImage, ...restPayload });
      return response.created({
        success: true,
        message: 'Addon created successfully',
        content: addon,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing Error');
    }
  }

  async update({ logger, request, response, params }: HttpContext) {
    try {
      const addon = await Addon.findOrFail(params.id);
      const payload = await request.validateUsing(addonValidator);
      const { image, ...restPayload } = payload;
      await addon.merge(restPayload).save();
      if (image) {
        addon.image = await attachmentManager.createFromFile(image);
      }
      await addon.save();

      return response.ok({ success: true, message: 'Addon updated successfully', content: addon });
    } catch (error) {
      errorHandler(error, response, logger, 'Update Error');
    }
  }

  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const addon = await Addon.findOrFail(params.id);
      await addon.merge(payload).save();

      return response.ok({ success: true, message: 'Changes saved successfully.', content: addon });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Update error');
    }
  }

  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await Addon.findOrFail(id);
      await data.delete();
      return response.ok({ success: true, message: 'Addon deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting Error');
    }
  }

  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await Addon.query().whereIn('id', payload.ids).delete();

      return response.ok({ success: true, message: 'Addons deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Deleting Error');
    }
  }

  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await Addon.query().whereIn('id', ids).update(restPayload);

      return response.ok({ success: true, message: 'Addons changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Custom Update Error');
    }
  }
}
