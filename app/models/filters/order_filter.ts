import { BaseModelFilter } from 'adonis-lucid-filter';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import Order from '#models/order';
import { DateTime } from 'luxon';

export default class OrderFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Order>;

  createdAt(value: string): void {
    const formattedDate = DateTime.fromISO(value).toISODate();
    if (formattedDate) {
      this.$query.whereRaw('DATE(created_at) = ?', [formattedDate]);
    }
  }

  user(value: string): void {
    this.$query.where('userId', value);
  }

  deliveryMan(value: string): void {
    this.$query.where('deliveryManId', value);
  }

  type(value: string): void {
    this.$query.where('type', value);
  }

  status(value: string): void {
    this.$query.where('status', value);
  }

  deliveryDate(value: string): void {
    const formattedDate = DateTime.fromISO(value).toISODate();
    if (formattedDate) {
      this.$query.whereRaw('DATE(delivery_date) = ?', [formattedDate]);
    }
  }

  paymentType(value: string): void {
    this.$query.where('paymentType', value);
  }

  paymentStatus(value: string): void {
    if (value === 'true') {
      this.$query.where('paymentStatus', true);
    }

    if (value === 'false') {
      this.$query.where('paymentStatus', false);
    }
  }

  search(value: string): void {
    this.$query.where((builder) => {
      builder.where('orderNumber', 'Like', `%${value}%`).orWhereHas('user', (query) => {
        query.where('firstName', 'LIKE', `%${value}%`).orWhere('lastName', 'LIKE', `%${value}%`);
      });
    });
  }
}
