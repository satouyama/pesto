import errorHandler from '#exceptions/error_handler';
import Variant from '#models/variant';
import {
  bulkCustomUpdateValidator,
  bulkDeleteValidator,
  customUpdateValidator,
  variantValidator,
} from '#validators/variant';
import type { HttpContext } from '@adonisjs/core/http';
import { stringify } from 'csv-stringify/sync';

export default class VariantsController {
  async index({ logger, request, response }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const dataQuery = Variant.filter(input)
        .preload('variantOptions')
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Variants Error');
    }
  }

  async exportVariants({ logger, request, response }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const variants = await Variant.filter(input)
        .preload('variantOptions')
        .orderBy('createdAt', 'desc');

      const csvHeaders = ['Variant Name', 'Options', 'Required', 'Multi-Selection', 'Avaibility'];
      const csvRows = variants.map((variant) => [
        variant.name,
        variant.variantOptions.length,
        variant.requirement === 'optional' ? false : true,
        variant.allowMultiple,
        variant.isAvailable,
      ]);

      const csvData = stringify([csvHeaders, ...csvRows], { header: false });
      response.header('Content-Type', 'text/csv');
      response.header('Content-Disposition', `attachment; filename="variants.csv"`);
      response.send(csvData);
    } catch (error) {
      errorHandler(error, response, logger, 'Export Variants Error');
    }
  }

  async getById({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await Variant.query().preload('variantOptions').where('id', id).firstOrFail();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Variant Get By Id Error');
    }
  }

  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(variantValidator);
      const isExist = await Variant.findBy('value', payload.value);
      if (isExist) {
        return response.badRequest({
          success: false,
          message: 'Value already exist in the database',
        });
      }
      const { variantOptions, ...restPayload } = payload;
      const variant = await Variant.create(restPayload);

      if (variantOptions && variantOptions.length > 0) {
        await variant.related('variantOptions').createMany(variantOptions);
      }

      await variant.load('variantOptions');
      return response.created({
        success: true,
        message: 'Variant created successfully',
        content: variant,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing Variant Error');
    }
  }

  async update({ logger, request, response, params }: HttpContext) {
    try {
      const variant = await Variant.findOrFail(params.id);
      const payload = await request.validateUsing(variantValidator);
      variant.merge(payload);
      await variant.save();
      await variant.load('variantOptions');

      if (payload.variantOptions) {
        const existingOptionIds = variant.variantOptions?.map((option) => option.id);
        const payloadOptionIds = payload.variantOptions
          .map((option: any) => option.id)
          .filter((id: number) => id);
        const optionIdsToDelete = existingOptionIds.filter((id) => !payloadOptionIds.includes(id));

        await variant.related('variantOptions').query().whereIn('id', optionIdsToDelete).delete();

        for (const optionPayload of payload.variantOptions) {
          if (optionPayload.id) {
            const existingOption = variant.variantOptions.find(
              (option) => option.id === optionPayload.id
            );
            if (existingOption) {
              existingOption.merge(optionPayload);
              await existingOption.save();
            }
          } else {
            await variant.related('variantOptions').create(optionPayload);
          }
        }
      }

      await variant.load('variantOptions');
      return response.ok({
        success: true,
        message: 'Variant updated successfully',
        content: variant,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Variant Error');
    }
  }

  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const variant = await Variant.findOrFail(params.id);
      await variant.merge(payload).save();

      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: variant,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Fields Updating Error');
    }
  }

  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await Variant.query().whereIn('id', ids).update(restPayload);
      return response.ok({ message: 'Variants changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Custom Fields Updating Error');
    }
  }

  async delete({ logger, params, response }: HttpContext) {
    const { id } = params;
    try {
      const variant = await Variant.findOrFail(id);
      await variant.delete();
      return response.json({ message: 'Variant deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting Variant Error');
    }
  }

  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await Variant.query().whereIn('id', payload.ids).delete();
      return response.ok({ message: 'Variants deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Deleting Variant Error');
    }
  }
}
