import { DateTime } from 'luxon';
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import { generateUniqueOrderNumber } from '../utils/generate_unique_id.js';
import OrderItem from '#models/order_item';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import { Filterable } from 'adonis-lucid-filter';
import { compose } from '@adonisjs/core/helpers';
import OrderFilter from '#models/filters/order_filter';
import User from '#models/user';
import formatPrecision from '../utils/format_precision.js';
import OrderCharge from '#models/order_charge';

export default class Order extends compose(BaseModel, Filterable) {
  static $filter = () => OrderFilter;

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare orderNumber: string;

  @column()
  declare userId: number | null;

  @column()
  declare type: 'dine_in' | 'delivery' | 'pickup';

  @column()
  declare totalQuantity: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare total: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare totalTax: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare totalCharges: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare discount: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare manualDiscount: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare deliveryCharge: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare grandTotal: number;

  @column()
  declare paymentType: 'cash' | 'card' | 'paypal' | 'stripe';

  @column()
  declare paymentStatus: boolean;

  @column()
  declare paymentInfo: string | null;

  @column()
  declare customerNote: string | null;

  @column()
  declare deliveryDate: DateTime | string | null;

  @column()
  declare status:
    | 'pending'
    | 'processing'
    | 'ready'
    | 'on_delivery'
    | 'completed'
    | 'canceled'
    | 'failed';

  @column()
  declare deliveryManId: number | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;

  @belongsTo(() => User, { foreignKey: 'deliveryManId' })
  declare deliveryMan: BelongsTo<typeof User>;

  @hasMany(() => OrderItem)
  declare orderItems: HasMany<typeof OrderItem>;

  @hasMany(() => OrderCharge)
  declare orderCharges: HasMany<typeof OrderCharge>;

  @beforeCreate()
  static async assignOrderNumber(order: Order) {
    order.orderNumber = await generateUniqueOrderNumber();
  }
}
