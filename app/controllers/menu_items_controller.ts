import errorHandler from '#exceptions/error_handler';
import MenuItem from '#models/menu_item';
import OrderItem from '#models/order_item';
import {
  bulkDeleteValidator,
  menuItemValidator,
  customUpdateValidator,
  bulkCustomUpdateValidator,
  menuItemUpdateValidator,
} from '#validators/menu_item';
import type { HttpContext } from '@adonisjs/core/http';
import { attachmentManager } from '@jrmc/adonis-attachment';
import { stringify } from 'csv-stringify/sync';

export default class MenuItemsController {
  async index({ logger, request, response }: HttpContext) {
    const { page, limit, popularLimit, includePopular, ...input } = request.qs();
    try {
      const { global } = request.params();
      const dataQuery = MenuItem.filter(input)
        .if(global, (query) => {
          query.where('isAvailable', true);
        })
        .preload('category', (query) => {
          query.if(global, (cQuery) => {
            cQuery.where('isAvailable', true);
          });
        })
        .preload('variants', (query) => {
          query
            .if(global, (vQuery) => {
              vQuery.where('isAvailable', true);
            })
            .preload('variantOptions');
        })
        .preload('charges', (query) => {
          query.if(global, (cQuery) => {
            cQuery.where('isAvailable', true);
          });
        })
        .preload('addons', (query) => {
          query.if(global, (aQuery) => {
            aQuery.where('isAvailable', true);
          });
        })
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();

      if (popularLimit && includePopular === 'true') {
        const popularItemsLimit = popularLimit || 10;
        const popularItems = await this.mostPopularItems(popularItemsLimit);
        return response.json({ data, popularItems });
      }
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Menu Items Error');
    }
  }

  async exportMenuItems({ logger, request, response }: HttpContext) {
    const { listType, page, limit, ...input } = request.qs();
    try {
      const menuItems = await MenuItem.filter(input)
        .if(global, (query) => {
          query.where('isAvailable', true);
        })
        .preload('category')
        .preload('variants', (query) => {
          query.preload('variantOptions');
        })
        .preload('charges')
        .preload('addons')
        .orderBy('createdAt', 'desc');
      const csvHeaders = ['Name', 'Price', 'Discount', 'Addons', 'Food Type', 'Avaibility'];
      const csvRows = menuItems.map((menuItem) => [
        menuItem.name,
        menuItem.price.toFixed(2),
        menuItem.discountType === 'amount'
          ? menuItem.discount
          : (menuItem.price * (menuItem.discount / 100)).toFixed(2),
        menuItem.addons.length > 0 ? true : false,
        menuItem.foodType,
        menuItem.isAvailable,
      ]);

      const csvData = stringify([csvHeaders, ...csvRows], { header: false });
      response.header('Content-Type', 'text/csv');
      response.header('Content-Disposition', `attachment; filename="menu_items.csv"`);
      response.send(csvData);
    } catch (error) {
      errorHandler(error, response, logger, 'Export Menu Items Error');
    }
  }

  private async mostPopularItems(limit: number) {
    const popularMenuItems = await OrderItem.query()
      .select('menuItemId')
      .count('* as orderCount')
      .groupBy('menuItemId')
      .orderBy('orderCount', 'desc')
      .limit(limit);

    const menuItemIds = popularMenuItems.map((item) => item.menuItemId);

    const menuItems = await MenuItem.query()
      .whereIn('id', menuItemIds)
      .preload('category', (query) => {
        query.where('isAvailable', true);
      })
      .preload('variants', (query) => {
        query.where('isAvailable', true).preload('variantOptions');
      })
      .preload('charges', (query) => {
        query.where('isAvailable', true);
      })
      .preload('addons', (query) => {
        query.where('isAvailable', true);
      });

    return menuItems.map((menuItem) => {
      const orderCount =
        popularMenuItems.find((item) => item.menuItemId === menuItem.id)?.$extras.orderCount || 0;
      return { menuItem, orderCount };
    });
  }

  async getById({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await MenuItem.query()
        .if(global, (query) => {
          query.where('isAvailable', true);
        })
        .preload('category', (query) => {
          query.if(global, (cQuery) => {
            cQuery.where('isAvailable', true);
          });
        })
        .preload('variants', (query) => {
          query
            .if(global, (vQuery) => {
              vQuery.where('isAvailable', true);
            })
            .preload('variantOptions');
        })
        .preload('charges', (query) => {
          query.if(global, (cQuery) => {
            cQuery.where('isAvailable', true);
          });
        })
        .preload('addons', (query) => {
          query.if(global, (aQuery) => {
            aQuery.where('isAvailable', true);
          });
        })
        .andWhere('id', id)
        .firstOrFail();

      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Get Menu Item By Id Error');
    }
  }

  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(menuItemValidator);
      const { image, chargeIds, addonIds, variantIds, ...restPayload } = payload;
      const proccessedImage = await attachmentManager.createFromFile(image);
      const menuItem = await MenuItem.create({ image: proccessedImage, ...restPayload });

      if (chargeIds) {
        await menuItem.related('charges').attach(chargeIds);
      }

      if (addonIds) {
        await menuItem.related('addons').attach(addonIds);
      }

      if (variantIds) {
        await menuItem.related('variants').attach(variantIds);
      }

      await menuItem.load('charges');
      await menuItem.load('addons');
      await menuItem.load('variants', (query) => {
        query.preload('variantOptions');
      });

      return response.created({
        success: true,
        message: 'Menu item created successfully',
        content: menuItem,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing Menu Item Error');
    }
  }

  async update({ logger, request, response, params }: HttpContext) {
    try {
      const menuItem = await MenuItem.findOrFail(params.id);
      const payload = await request.validateUsing(menuItemUpdateValidator);
      const { image, chargeIds, addonIds, variantIds, ...restPayload } = payload;
      menuItem.merge(restPayload);
      if (image) {
        menuItem.image = await attachmentManager.createFromFile(image);
      }
      await menuItem.save();

      if (chargeIds && chargeIds?.length > 0) {
        await menuItem.related('charges').sync(chargeIds);
      } else {
        await menuItem.related('charges').detach();
      }

      if (addonIds && addonIds?.length > 0) {
        await menuItem.related('addons').sync(addonIds);
      } else {
        await menuItem.related('addons').detach();
      }

      if (variantIds && variantIds?.length > 0) {
        await menuItem.related('variants').sync(variantIds);
      } else {
        await menuItem.related('variants').detach();
      }

      await menuItem.load('charges');
      await menuItem.load('addons');
      await menuItem.load('variants', (query) => {
        query.preload('variantOptions');
      });

      return response.ok({
        success: true,
        message: 'Menu item updated successfully',
        content: menuItem,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Menu Item Error');
    }
  }

  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const menuItem = await MenuItem.findOrFail(params.id);
      await menuItem.merge(payload).save();

      await menuItem.load('charges');
      await menuItem.load('addons');
      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: menuItem,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Fields Updating Error');
    }
  }

  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await MenuItem.query().whereIn('id', ids).update(restPayload);

      return response.ok({ success: true, message: 'Menu items changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Custom Fields Updating Error');
    }
  }

  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await MenuItem.findOrFail(id);
      await data.delete();
      return response.json({ success: true, message: 'Menu item deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Menu Item Deleting Error');
    }
  }

  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await MenuItem.query().whereIn('id', payload.ids).delete();

      return response.ok({ success: true, message: 'Menu items deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Menu Item Deleting Error');
    }
  }
}
