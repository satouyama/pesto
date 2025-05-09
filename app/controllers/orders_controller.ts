import errorHandler from '#exceptions/error_handler';
import MenuItem from '#models/menu_item';
import Order from '#models/order';
import {
  bulkCustomUpdateValidator,
  customUpdateValidator,
  orderCalculationValidator,
  orderUpdateValidator,
  orderValidator,
} from '#validators/order';
import type { HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import Roles from '../enum/roles.js';
import BusinessSetup from '#models/business_setup';
import notification_service from '#services/notification_service';
import { stringify } from 'csv-stringify/sync';
import Setting from '#models/setting';
import Paypal from '#services/payment/paypal';
import StripePayment from '#services/payment/stripe';
import PaymentMethod from '#models/payment_method';
import transmit from '@adonisjs/transmit/services/main';
import OrderItem from '#models/order_item';

type VariantType = { id: number; optionIds: Array<number> };
type AddonType = { id: number; quantity: number };
type OrderItemType = {
  menuItemId: number;
  quantity: number;
  variants: VariantType[];
  addons: AddonType[];
};

export default class OrdersController {
  async index({ logger, request, response, auth }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const dataQuery = Order.filter(input)
        .where('userId', auth.user!.id)
        .preload('orderItems', (query) => {
          query.preload('menuItem');
        })
        .preload('deliveryMan')
        .preload('orderCharges')
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Order Error');
    }
  }

  async adminIndex({ logger, request, response, auth }: HttpContext) {
    const { listType, page, limit, ...input } = request.qs();
    try {
      if (listType === 'history' && auth.user!.roleId === Roles.DISPLAY) {
        return response.badRequest({
          success: false,
          message: 'You have no permission to view this page',
        });
      }
      const dataQuery = Order.filter(input)
        .if(listType, (query) => {
          if (listType === 'active')
            return query.whereIn('status', ['pending', 'processing', 'ready', 'on_delivery']);
          if (listType === 'history')
            return query.whereIn('status', ['completed', 'canceled', 'failed']);
        })
        .preload('user')
        .preload('orderItems', (query) => {
          query.preload('menuItem');
        })
        .preload('deliveryMan')
        .preload('orderCharges')
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Admin Index Order Error');
    }
  }

  async exportOrders({ logger, request, response }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const orders = await Order.filter(input)
        .whereIn('status', ['completed', 'canceled', 'failed'])
        .preload('user')
        .preload('orderItems', (query) => {
          query.preload('menuItem');
        })
        .preload('deliveryMan')
        .preload('orderCharges')
        .orderBy('createdAt', 'desc');

      const csvHeaders = [
        'Order Number',
        'Created On',
        'Customer Name',
        'Type',
        'Total',
        'Payment',
        'Status',
      ];
      const csvRows = orders.map((order) => [
        order.orderNumber,
        DateTime.fromISO(order.createdAt?.toString() || '').toFormat('yyyy-MM-dd'),
        order?.user?.fullName || 'Guest User',
        order.type,
        order.grandTotal,
        order.paymentStatus,
        order.status,
      ]);

      const csvData = stringify([csvHeaders, ...csvRows], { header: false });
      response.header('Content-Type', 'text/csv');
      response.header('Content-Disposition', `attachment; filename="orders.csv"`);
      response.send(csvData);
    } catch (error) {
      errorHandler(error, response, logger, 'Export Order Error');
    }
  }

  async orderStatusCount({ logger, request, response }: HttpContext) {
    const { timeframe = 'lifetime' } = request.qs();

    const days = timeframe === 'month' ? 30 : timeframe === 'week' ? 7 : 0;

    const startDate = DateTime.now().minus({ days }).startOf('day').toSQL();
    const endDate = DateTime.now().endOf('day').toSQL();

    try {
      const orderCounts = await Order.query()
        .if(timeframe !== 'lifetime', (query) => {
          query.whereBetween('createdAt', [startDate, endDate]);
        })
        .select('status')
        .count('* as count')
        .groupBy('status');

      const statusCounts = {
        pending: 0,
        processing: 0,
        ready: 0,
        on_delivery: 0,
        completed: 0,
        canceled: 0,
        failed: 0,
      };

      orderCounts.forEach((order) => {
        switch (order.status) {
          case 'pending':
            statusCounts.pending = order.$extras.count;
            break;
          case 'processing':
            statusCounts.processing = order.$extras.count;
            break;
          case 'ready':
            statusCounts.ready = order.$extras.count;
            break;
          case 'on_delivery':
            statusCounts.on_delivery = order.$extras.count;
            break;
          case 'completed':
            statusCounts.completed = order.$extras.count;
            break;
          case 'canceled':
            statusCounts.canceled = order.$extras.count;
            break;
          case 'failed':
            statusCounts.failed = order.$extras.count;
            break;
        }
      });

      return response.json({
        data: statusCounts,
        timeframe,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Order Status Count Error');
    }
  }

  async getById({ logger, response, params }: HttpContext) {
    try {
      const data = await this.fetchOrderWithRelations(params.id);
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Get Order By Id Error');
    }
  }

  async generateInvoice({ logger, response, params, view, auth }: HttpContext) {
    try {
      const order = await this.fetchOrderWithRelations(params.id);
      type Charge = {
        id?: number;
        type: string;
        name: string;
        amount: number;
      };

      if (auth?.user?.roleId === Roles.CUSTOMER && auth?.user.id !== order.userId) {
        return response.abort({
          status: false,
          message: 'You have no permission to view this invoice',
        });
      }

      const orderItems: OrderItem[] = order.orderItems.map((ele: any) => {
        const data = ele.serialize({ fields: { emit: ['variants', 'addons', 'charges'] } });

        let parsedCharges: Charge[] = JSON.parse(ele.charges) || [];

        const aggregatedCharges = parsedCharges.reduce<Record<string, Charge>>((acc, charge) => {
          if (!charge || !charge.name) return acc;

          if (acc[charge.name] && acc[charge.type]) {
            acc[charge.name].amount += charge.amount;
          } else {
            acc[charge.name] = { ...charge };
          }

          return acc;
        }, {});

        let parsedVariants = JSON.parse(ele.variants) || [];
        let parsedAddons = JSON.parse(ele.addons) || [];

        return {
          ...data,
          variants: parsedVariants,
          addons: parsedAddons,
          charges: Object.values(aggregatedCharges),
        };
      });

      const formattedDate = DateTime.fromISO(order.createdAt?.toString() || '').toFormat(
        'yyyy-MM-dd'
      );
      const businessSetup = await BusinessSetup.firstOrFail();
      const baseUrl = await Setting.findBy('key', 'branding');

      let POSCharges: any = [];
      order?.orderCharges?.forEach((charge) => {
        let totalCharge = 0;
        totalCharge += charge.amount;
        const chargeIndex = POSCharges.findIndex((c: any) => c.name === charge.name);
        if (chargeIndex === -1) {
          POSCharges.push({ ...charge.serialize(), amount: totalCharge });
        } else {
          POSCharges[chargeIndex].amount += totalCharge;
        }
      });
      return await view.render('invoice', {
        order,
        orderItems,
        formattedDate,
        businessInfo: businessSetup,
        orderCharges: POSCharges,
        baseUrl: baseUrl?.value1,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Print Invoice By Id Error');
    }
  }

  async calculate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(orderCalculationValidator);
      const businessSetup = await BusinessSetup.firstOrFail();
      const deliveryCharge = payload.type === 'delivery' ? businessSetup.deliveryCharge : 0;
      const {
        total,
        totalQuantity,
        discount,
        totalTax,
        totalCharges,
        orderItemsData,
        chargesData,
      } = await this.processOrderItems(payload.orderItems);

      const grandTotal =
        total + totalTax + totalCharges + deliveryCharge - discount - (payload.manualDiscount || 0);

      if (grandTotal < 0) {
        return response.badRequest({
          success: false,
          message: "Grand total can't be less than zero",
        });
      }

      return response.json({
        total,
        totalQuantity,
        discount,
        manualDiscount: payload.manualDiscount,
        totalTax,
        totalCharges,
        deliveryCharge,
        grandTotal,
        orderItemsData,
        chargesData,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Calculating order Error');
    }
  }

  async store({ logger, request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(orderValidator);

      if (auth.user!.roleId === Roles.CUSTOMER && auth.user!.id !== payload.userId) {
        return response.badRequest({
          success: false,
          message: 'You have no permission to create this order',
        });
      }

      const { orderItems, deliveryDate, ...restPayload } = payload;
      const businessSetup = await BusinessSetup.firstOrFail();
      if (!businessSetup.guestCheckout && payload.type !== 'dine_in' && !payload.userId) {
        return response.badRequest({
          success: false,
          message: 'Ordering as a guest is not allowed!',
        });
      }
      const deliveryCharge = payload.type === 'delivery' ? businessSetup.deliveryCharge : 0;
      const {
        total,
        totalQuantity,
        discount,
        totalTax,
        totalCharges,
        orderItemsData,
        chargesData,
      } = await this.processOrderItems(orderItems);

      let grandTotal =
        total + totalTax + totalCharges + deliveryCharge - discount - (payload.manualDiscount || 0);

      if (grandTotal < 0) {
        return response.badRequest({
          success: false,
          message: "Grand total can't be less than zero",
        });
      }

      const order = await Order.create({
        ...restPayload,
        deliveryDate: DateTime.fromISO(deliveryDate || '').toSQL({ includeOffset: false }),
        totalQuantity,
        total,
        totalTax,
        totalCharges,
        discount: discount,
        manualDiscount: payload.manualDiscount || 0,
        deliveryCharge,
        grandTotal,
      });

      await order.related('orderItems').createMany(orderItemsData);
      await order.related('orderCharges').createMany(chargesData);

      const data = await this.fetchOrderWithRelations(order.id);

      if (auth.user!.roleId === Roles.CUSTOMER && !['cash', 'card'].includes(payload.paymentType)) {
        const methodConfig = await PaymentMethod.query()
          .where('key', payload.paymentType)
          .andWhere('status', true)
          .first();
        if (!methodConfig) {
          await order.delete();
          return response.badRequest({ success: false, message: 'Payment method is not active' });
        }

        if (payload.paymentType === 'paypal') {
          const paypal = new Paypal(methodConfig);
          const paypalOrderData = await paypal.createPaypalOrder(data);
          if (!paypalOrderData) {
            await order.delete();
            return response.badRequest({
              success: false,
              message: 'Error in generating payment link',
            });
          }
          await data
            .merge({
              paymentInfo: JSON.stringify(paypalOrderData),
            })
            .save();
          const redirectUrl = paypalOrderData.links.find(
            (link: any) => link.rel === 'approve'
          ).href;
          return response.json({ success: true, redirectUrl });
        }

        if (payload.paymentType === 'stripe') {
          const stripe = new StripePayment(methodConfig);
          const sessionData = await stripe.createSession(data);
          if (!sessionData.url) {
            await order.delete();
            return response.badRequest({
              success: false,
              message: 'Error in generating payment link',
            });
          }
          await data
            .merge({
              paymentInfo: JSON.stringify(sessionData),
            })
            .save();
          return response.json({ success: true, redirectUrl: sessionData.url });
        }
      }

      await notification_service.sendNewOrderNotification(auth.user!, data);

      transmit.broadcast('orders', { success: true });
      return response.created({
        success: true,
        message: 'Order has been placed successfully',
        content: data,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing order Error');
    }
  }

  async update({ logger, request, response, params }: HttpContext) {
    try {
      const order = await this.fetchOrderWithRelations(params.id);
      const previousStatus = order.status;
      const payload = await request.validateUsing(orderUpdateValidator);
      if (
        payload.status &&
        payload.status === 'completed' &&
        !order.paymentStatus &&
        !payload.paymentStatus
      ) {
        return response.badRequest({
          success: false,
          message: `Order status can't be completed until paid!`,
        });
      }
      const { manualDiscount, ...restPayload } = payload;
      order.merge(restPayload);

      if (payload.type !== 'delivery') {
        order.deliveryManId = null;
        order.grandTotal = order.grandTotal - order.deliveryCharge;
        order.deliveryCharge = 0;
      }

      if (order.type !== 'delivery' && payload.type === 'delivery') {
        const businessSetup = await BusinessSetup.firstOrFail();
        const deliveryCharge = businessSetup.deliveryCharge;
        order.grandTotal = order.grandTotal + deliveryCharge;
        order.deliveryCharge = deliveryCharge;
      }

      if (manualDiscount !== undefined && manualDiscount !== order.manualDiscount) {
        order.grandTotal = order.grandTotal + order.manualDiscount - manualDiscount;
        order.manualDiscount = manualDiscount;
      }
      await order.save();

      if (payload.status && previousStatus !== payload.status) {
        await notification_service.sendOrderStatusNotification(order);
      }

      transmit.broadcast('orders', { success: true });
      return response.ok({
        success: true,
        message: 'Order updated successfully',
        content: order,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Order Error');
    }
  }

  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const order = await this.fetchOrderWithRelations(params.id);
      if (payload.status && payload.status === 'completed' && !order.paymentStatus) {
        return response.badRequest({
          success: false,
          message: `Order status can't be completed until it is paid!`,
        });
      }
      await order.merge(payload).save();

      if (payload.status && order.status !== payload.status) {
        await notification_service.sendOrderStatusNotification(order);
      }

      if (
        payload.deliveryManId &&
        (!order.deliveryManId || payload.deliveryManId !== order.deliveryManId)
      ) {
        await notification_service.sendDeliveryManAssignedNotification(order);
      }

      transmit.broadcast('orders', { success: true });
      return response.ok({
        success: true,
        message: 'Order saved successfully.',
        content: order,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Update error');
    }
  }

  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await Order.query().whereIn('id', ids).update(restPayload);
      transmit.broadcast('orders', { success: true });
      return response.ok({ success: true, message: 'Order changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk custom update error');
    }
  }

  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const order = await Order.findOrFail(id);
      await order.delete();
      transmit.broadcast('orders', { success: true });
      return response.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting error');
    }
  }

  // --------------------- Helper Functions ---------------------------
  private async processOrderItems(orderItems: OrderItemType[]) {
    let total = 0;
    let totalQuantity = 0;
    let discount = 0;
    let totalTax = 0;
    let totalCharges = 0;

    const orderItemsData: any[] = [];
    const chargesData: any[] = [];

    for (const item of orderItems) {
      const { itemData, itemCharges } = await this.processSingleOrderItem(item);

      total += (itemData.price + itemData.addonsAmount + itemData.variantsAmount) * item.quantity;
      totalTax += itemData.taxAmount * item.quantity;
      totalCharges += itemData.chargeAmount * item.quantity;
      discount += itemData.discountAmount * item.quantity;
      totalQuantity += item.quantity;

      orderItemsData.push(itemData);
      chargesData.push(...itemCharges);
    }

    return { total, totalQuantity, discount, totalTax, totalCharges, orderItemsData, chargesData };
  }

  private async processSingleOrderItem(item: OrderItemType) {
    const menuItem = await MenuItem.query()
      .where('id', item.menuItemId)
      .andWhere('isAvailable', true)
      .preload('charges', (query) => {
        query.where('isAvailable', true);
      })
      .first();
    if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);

    const variants = await this.calculateVariants(item.variants, menuItem);
    const addons = await this.calculateAddons(item.addons, menuItem);

    const basePrice = menuItem.price || 0;
    const variantPrice = this.calculateVariantPriceFromItems(variants);
    const addonPrice = this.calculateAddonPriceFromItems(addons);
    const itemDiscount = this.calculateDiscount(menuItem, basePrice, variantPrice);
    const { itemTax, itemCharge, itemCharges } = this.calculateItemCharges(
      menuItem,
      basePrice + variantPrice + addonPrice - itemDiscount,
      item.quantity
    );

    const totalPrice = basePrice + itemTax + itemCharge + variantPrice + addonPrice - itemDiscount;

    const itemData = {
      menuItemId: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      variants: JSON.stringify(variants),
      addons: JSON.stringify(addons),
      charges: JSON.stringify(itemCharges),
      addonsAmount: addonPrice,
      variantsAmount: variantPrice,
      taxAmount: itemTax,
      chargeAmount: itemCharge,
      discountAmount: itemDiscount,
      totalPrice,
      quantity: item.quantity,
      grandPrice: totalPrice * item.quantity,
    };

    return { itemData, itemCharges };
  }

  private async calculateVariants(variants: VariantType[], menuItem: MenuItem) {
    return Promise.all(
      variants.map(async (ele) => {
        const variant = await menuItem
          .related('variants')
          .query()
          .wherePivot('variant_id', ele.id)
          .andWhere('isAvailable', true)
          .preload('variantOptions', (query) => {
            query.whereIn('id', ele.optionIds);
          })
          .first();
        if (!variant) return null;

        const price = variant.variantOptions.reduce((sum, option) => sum + option.price, 0);

        return { ...variant.serialize(), price };
      })
    );
  }

  private async calculateAddons(addons: AddonType[], menuItem: MenuItem) {
    return Promise.all(
      addons.map(async (ele) => {
        const addon = await menuItem
          .related('addons')
          .query()
          .wherePivot('addon_id', ele.id)
          .andWhere('isAvailable', true)
          .first();
        if (!addon) return null;

        return {
          ...addon.serialize(),
          quantity: ele.quantity,
          grandPrice: ele.quantity * addon.price,
        };
      })
    );
  }

  private calculateItemCharges(menuItem: MenuItem, basePrice: number, quantity: number) {
    let itemTax = 0;
    let itemCharge = 0;
    const itemCharges: { name: string; type: string; amount: number }[] = [];

    menuItem.charges.forEach((charge) => {
      const amount =
        charge.amountType === 'percentage' ? basePrice * (charge.amount / 100) : charge.amount;

      if (charge.type === 'tax') {
        itemTax += amount;
        itemCharges.push({ name: charge.name, type: 'tax', amount: amount * quantity });
      } else {
        itemCharge += amount;
        itemCharges.push({ name: charge.name, type: 'charge', amount: amount * quantity });
      }
    });

    return { itemTax, itemCharge, itemCharges };
  }

  private calculateDiscount(menuItem: MenuItem, basePrice: number, variantPrice: number): number {
    const totalItemPrice = basePrice + variantPrice;

    if (menuItem.discountType === 'percentage') {
      return totalItemPrice * (menuItem.discount / 100);
    } else if (menuItem.discountType === 'amount') {
      return menuItem.discount;
    }

    return 0;
  }

  private calculateVariantPriceFromItems(items: ({ price: number } | null)[]): number {
    return items.reduce((sum, item) => sum + (item?.price || 0), 0);
  }

  private calculateAddonPriceFromItems(
    items: ({
      grandPrice: number;
    } | null)[]
  ): number {
    return items.reduce((sum, item) => sum + (item?.grandPrice || 0), 0);
  }

  private async fetchOrderWithRelations(orderId: number) {
    return Order.query()
      .preload('user')
      .preload('orderItems', (query) => {
        query.preload('menuItem');
      })
      .preload('deliveryMan')
      .preload('orderCharges')
      .where('id', orderId)
      .firstOrFail();
  }
}
