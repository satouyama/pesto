import vine from '@vinejs/vine';
import { idsExist } from './rules/array.js';
import Roles from '../enum/roles.js';

export const orderValidator = vine.compile(
  vine.object({
    userId: vine
      .number()
      .exists(async (db, value) => {
        return (
          db.from('users').where('id', value).andWhere('role_id', Roles.CUSTOMER).first() || false
        );
      })
      .optional()
      .requiredWhen('type', '!=', 'dine_in'),
    type: vine.enum(['dine_in', 'delivery', 'pickup']),
    manualDiscount: vine.number().optional(),
    paymentType: vine.enum(['cash', 'card', 'paypal', 'stripe']),
    customerNote: vine.string().nullable().optional(),
    deliveryDate: vine.string().trim().optional().requiredWhen('type', '=', 'delivery'),
    orderItems: vine.array(
      vine.object({
        menuItemId: vine.number().exists(async (db, value) => {
          return db.from('menu_items').where('id', value).first();
        }),
        quantity: vine.number(),
        variants: vine
          .array(
            vine.object({
              id: vine.number().exists(async (db, value) => {
                return db.from('variants').where('id', value).first();
              }),
              optionIds: vine
                .array(vine.number())
                .distinct()
                .compact()
                .use(idsExist({ table: 'variant_options', column: 'id' })),
            })
          )
          .distinct('id')
          .compact(),
        addons: vine
          .array(
            vine.object({
              id: vine.number().exists(async (db, value) => {
                return db.from('addons').where('id', value).first();
              }),
              quantity: vine.number(),
            })
          )
          .distinct('id')
          .compact(),
      })
    ),
  })
);

export const orderCalculationValidator = vine.compile(
  vine.object({
    type: vine.enum(['dine_in', 'delivery', 'pickup']),
    manualDiscount: vine.number().optional(),
    orderItems: vine.array(
      vine.object({
        menuItemId: vine.number().exists(async (db, value) => {
          return db.from('menu_items').where('id', value).first();
        }),
        quantity: vine.number(),
        variants: vine
          .array(
            vine.object({
              id: vine.number().exists(async (db, value) => {
                return db.from('variants').where('id', value).first();
              }),
              optionIds: vine
                .array(vine.number())
                .distinct()
                .compact()
                .use(idsExist({ table: 'variant_options', column: 'id' })),
            })
          )
          .distinct('id')
          .compact(),
        addons: vine
          .array(
            vine.object({
              id: vine.number().exists(async (db, value) => {
                return db.from('addons').where('id', value).first();
              }),
              quantity: vine.number(),
            })
          )
          .distinct('id')
          .compact(),
      })
    ),
  })
);

export const orderUpdateValidator = vine.compile(
  vine.object({
    userId: vine
      .number()
      .exists(async (db, value) => {
        return (
          db.from('users').where('id', value).andWhere('role_id', Roles.CUSTOMER).first() || false
        );
      })
      .optional()
      .requiredWhen('type', '!=', 'dine_in'),
    type: vine.enum(['dine_in', 'delivery', 'pickup']),
    manualDiscount: vine.number().optional(),
    paymentType: vine.enum(['cash', 'card', 'paypal', 'stripe']),
    deliveryDate: vine.string().trim().optional().requiredWhen('type', '=', 'delivery'),
    status: vine.enum((field) => {
      return getStatus(field.parent.type);
    }),
    customerNote: vine.string().nullable().optional(),
    paymentStatus: vine.boolean().optional(),
  })
);

export const customUpdateValidator = vine.compile(
  vine.object({
    status: vine
      .enum((field) => {
        return getStatus(field.parent.type);
      })
      .optional(),
    deliveryManId: vine
      .number()
      .exists(async (db, value) => {
        return db.from('users').where('id', value).andWhere('role_id', Roles.DELIVERY).first();
      })
      .optional(),
    paymentStatus: vine.boolean().optional(),
  })
);

export const bulkCustomUpdateValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'orders', column: 'id' })),
    status: vine
      .enum((field) => {
        return getStatus(field.parent.type);
      })
      .optional(),
    deliveryManId: vine
      .number()
      .exists(async (db, value) => {
        return db.from('users').where('id', value).andWhere('role_id', Roles.DELIVERY).first();
      })
      .optional(),
    paymentStatus: vine.boolean().optional(),
  })
);

function getStatus(type: string) {
  if (['dine_in', 'pickup'].includes(type)) {
    return ['pending', 'processing', 'ready', 'completed', 'canceled', 'failed'] as const;
  }
  return [
    'pending',
    'processing',
    'ready',
    'on_delivery',
    'completed',
    'canceled',
    'failed',
  ] as const;
}
