import errorHandler from '#exceptions/error_handler';
import Promotion from '#models/promotion';
import { promotionValidator, sliderValidator } from '#validators/promotion';
import type { HttpContext } from '@adonisjs/core/http';
import { attachmentManager } from '@jrmc/adonis-attachment';

export default class PromotionsController {
  async getDetail({ logger, request, response }: HttpContext) {
    try {
      const { type } = request.params();
      if (!['slider', 'welcome', 'message'].includes(type)) {
        return response.badRequest({
          success: false,
          message: 'Type mismatched! Please provide a valid type',
        });
      }
      const data = await Promotion.query().if(type, (query) => {
        query.where('type', type);
      });
      if (type && type === 'welcome') {
        return response.json({
          content: {
            type: 'welcome',
            welcomeImage: data[0]?.welcomeImage || null,
            welcomeStatus: data[0]?.welcomeStatus || false,
          },
        });
      }
      if (type && type === 'message') {
        return response.json({ content: { type: 'message', message: data[0]?.message || null } });
      }
      return response.json({
        content: data.map((ele) =>
          ele.serialize({ fields: { pick: ['id', 'type', 'sliderImage'] } })
        ),
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Get Promotion Info Error');
    }
  }

  async updatePromotion({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(promotionValidator);
      let data;
      if (payload.type === 'welcome') {
        data = {
          type: payload.type,
          welcomeImage: payload.welcomeImage
            ? await attachmentManager.createFromFile(payload.welcomeImage)
            : null,
          welcomeStatus: payload.welcomeStatus,
        };
      } else {
        data = {
          type: payload.type,
          message: payload.message || null,
        };
      }
      const promotion = await Promotion.updateOrCreate({ type: data.type }, data);
      return response.created({
        success: true,
        message: 'Promotion updated successfully',
        content: promotion,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Promotion Info Error');
    }
  }

  async updateSlider({ logger, request, response }: HttpContext) {
    try {
      const sliderPayload = [];
      const sliderItems = request.all()['slider'] || [];

      for (const [index, item] of sliderItems.entries()) {
        const image = request.file(`slider[${index}][image]`, {
          size: '10mb',
          extnames: ['jpg', 'png', 'jpeg', 'webp'],
        });
        sliderPayload.push({
          id: item.id ? Number(item.id) : null,
          image,
        });
      }
      const payload = await sliderValidator.validate({ slider: sliderPayload });
      const incomingIds = payload.slider.map((ele) => ele.id).filter((id) => id !== null);
      const existingRecords = await Promotion.query().where('type', 'slider').select('id');
      const existingIds = existingRecords.map((record) => record.id);

      const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

      const content = await Promise.all(
        payload.slider.map(async (ele) => {
          const sliderImage = ele.image ? await attachmentManager.createFromFile(ele.image) : null;
          if (ele.id) {
            const slider = await Promotion.query()
              .where('id', ele.id)
              .andWhere('type', 'slider')
              .first();
            if (!slider) {
              return null;
            }
            if (sliderImage) {
              await slider.merge({ sliderImage }).save();
            }
            return slider;
          }
          return await Promotion.create({ type: 'slider', sliderImage });
        })
      );

      if (idsToDelete.length > 0) {
        await Promotion.query().whereIn('id', idsToDelete).andWhere('type', 'slider').delete();
      }

      return response.created({
        success: true,
        message: 'Slider updated successfully',
        content,
        deletedIds: idsToDelete,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Slider Error');
    }
  }
}
