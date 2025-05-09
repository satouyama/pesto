import Category from '#models/category';
import type { HttpContext } from '@adonisjs/core/http';
import { attachmentManager } from '@jrmc/adonis-attachment';
import errorHandler from '#exceptions/error_handler';
import {
  bulkCustomUpdateValidator,
  bulkDeleteValidator,
  categoryUpdateValidator,
  categoryValidator,
  customUpdateValidator,
} from '#validators/category';
import BusinessSetup from '#models/business_setup';

export default class CategoriesController {
  async index({ logger, request, response }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const { global } = request.params();
      const businessSetup = await BusinessSetup.firstOrFail();
      const orderBy = businessSetup.sortCategories === 'priority_number' ? 'priority' : 'name';
      const dataQuery = Category.filter(input)
        .if(global, (query) => {
          query.where('isAvailable', true);
        })
        .preload('menuItems', (query) => {
          query.if(global, (mCuery) => {
            mCuery.where('isAvailable', true);
          });
        })
        .orderBy(orderBy, 'asc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Category Error');
    }
  }

  async getCategory({ logger, request, response }: HttpContext) {
    try {
      const { global, id } = request.params();
      const category = await Category.query()
        .if(global, (query) => {
          query.where('isAvailable', true);
        })
        .where('id', id)
        .preload('menuItems', (query) => {
          query
            .if(global, (mQuery) => {
              mQuery.where('isAvailable', true);
            })
            .preload('variants', (vQuery) => {
              vQuery
                .if(global, (vaQuery) => {
                  vaQuery.where('isAvailable', true);
                })
                .preload('variantOptions');
            })
            .preload('charges', (cQuery) => {
              cQuery.if(global, (chQuery) => {
                chQuery.where('isAvailable', true);
              });
            })
            .preload('addons', (aQuery) => {
              aQuery.if(global, (adQuery) => {
                adQuery.where('isAvailable', true);
              });
            });
        })
        .firstOrFail();
      return response.json(category);
    } catch (error) {
      errorHandler(error, response, logger, 'Get Category Error');
    }
  }

  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(categoryValidator);
      const { image, ...restPayload } = payload;
      const processedImage = await attachmentManager.createFromFile(image);
      const category = await Category.create({ image: processedImage, ...restPayload });
      await category.load('menuItems');
      return response.created({
        success: true,
        message: 'Category created successfully',
        content: category,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing Category Error');
    }
  }

  async update({ logger, request, response }: HttpContext) {
    try {
      const { id } = request.params();
      const payload = await request.validateUsing(categoryUpdateValidator);
      const { image, ...restPayload } = payload;
      const category = await Category.findOrFail(id);
      category.merge(restPayload);
      if (image) {
        category.image = await attachmentManager.createFromFile(image);
      }
      await category.save();
      await category.load('menuItems');
      return response.created({
        success: true,
        message: 'Category updated successfully',
        content: category,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Category Error');
    }
  }

  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const category = await Category.findOrFail(params.id);
      await category.merge(payload).save();

      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: category,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Update error');
    }
  }

  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await Category.query().whereIn('id', ids).update(restPayload);

      return response.ok({ success: true, message: 'Categories changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Custom Update Error');
    }
  }

  async delete({ logger, request, response }: HttpContext) {
    try {
      const { id } = request.params();
      const category = await Category.findOrFail(id);
      await category.delete();
      return response.ok({ success: true, message: 'Category deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting Error');
    }
  }

  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await Category.query().whereIn('id', payload.ids).delete();
      return response.ok({ success: true, message: 'Categories deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Deleting Error');
    }
  }
}
