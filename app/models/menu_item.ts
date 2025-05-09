import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations';
import { attachment, Attachmentable } from '@jrmc/adonis-attachment';
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment';
import Category from '#models/category';
import Charge from '#models/charge';
import Addon from '#models/addon';
import Variant from '#models/variant';
import { Filterable } from 'adonis-lucid-filter';
import { compose } from '@adonisjs/core/helpers';
import MenuItemFilter from '#models/filters/menu_item_filter';
import formatPrecision from '../utils/format_precision.js';
import OrderItem from '#models/order_item';

export default class MenuItem extends compose(BaseModel, Filterable, Attachmentable) {
  static $filter = () => MenuItemFilter;

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare categoryId: number | null;

  @column()
  declare name: string;

  @column()
  declare description: string;

  @column()
  declare foodType: 'veg' | 'nonVeg';

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare price: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare discount: number;

  @column()
  declare discountType: 'percentage' | 'amount';

  @column()
  declare isAvailable: boolean;

  @column()
  declare isRecommended: boolean;

  @attachment({
    preComputeUrl: true,
    variants: ['thumbnail', 'orginal'],
  })
  declare image: Attachment | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>;

  @manyToMany(() => Charge, {
    pivotTable: 'item_charges',
    localKey: 'id',
    pivotForeignKey: 'menu_item_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'charge_id',
    pivotTimestamps: true,
  })
  declare charges: ManyToMany<typeof Charge>;

  @manyToMany(() => Addon, {
    pivotTable: 'item_addons',
    localKey: 'id',
    pivotForeignKey: 'menu_item_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'addon_id',
    pivotTimestamps: true,
  })
  declare addons: ManyToMany<typeof Addon>;

  @manyToMany(() => Variant, {
    pivotTable: 'item_variants',
    localKey: 'id',
    pivotForeignKey: 'menu_item_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'variant_id',
    pivotTimestamps: true,
  })
  declare variants: ManyToMany<typeof Variant>;

  @hasMany(() => OrderItem)
  declare orderItems: HasMany<typeof OrderItem>;
}
