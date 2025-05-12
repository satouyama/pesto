import User from '#models/user';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import { BaseModelFilter } from 'adonis-lucid-filter';

export default class UserFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof User>;

  suspended(value: string): void {
    if (value === 'true') {
      this.$query.where('isSuspended', true);
    }

    if (value === 'false') {
      this.$query.where('isSuspended', false);
    }
  }

  emailVerified(value: string): void {
    if (value === 'true') {
      this.$query.where('isEmailVerified', true);
    }

    if (value === 'false') {
      this.$query.where('isEmailVerified', false);
    }
  }

  search(value: string): void {
    this.$query.where((builder) => {
      builder
        .whereILike('firstName', `%${value}%`)
        .orWhereILike('lastName', `%${value}%`)
        .orWhereILike('email', `%${value}%`)
        .orWhereILike('phoneNumber', `%${value}%`);
    });
  }
}
