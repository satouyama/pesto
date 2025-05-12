import { DateTime } from 'luxon';
import hash from '@adonisjs/core/services/hash';
import { compose } from '@adonisjs/core/helpers';
import { BaseModel, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid';
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session';
import Role from '#models/role';
import Token from '#models/token';
import { Filterable } from 'adonis-lucid-filter';
import UserFilter from '#models/filters/user_filter';
import Order from '#models/order';

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
});

export default class User extends compose(BaseModel, AuthFinder, Filterable) {
  static $filter = () => UserFilter;

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare roleId: number;

  @column()
  declare firstName: string;

  @column()
  declare lastName: string | null;

  @column()
  declare email: string;

  @column()
  declare isEmailVerified: boolean;

  @column()
  declare phoneNumber: string;

  @column()
  declare address: string;

  @column({ serializeAs: null })
  declare password: string;

  @column()
  declare isSuspended: boolean;

  @column()
  declare notificationSound: boolean;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;

  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User);

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>;

  @hasMany(() => Token)
  declare tokens: HasMany<typeof Token>;

  @hasMany(() => Token, {
    onQuery: (query) => query.where('type', 'PASSWORD_RESET'),
  })
  declare passwordResetTokens: HasMany<typeof Token>;

  @hasMany(() => Token, {
    onQuery: (query) => query.where('type', 'VERIFY_EMAIL'),
  })
  declare verifyEmailTokens: HasMany<typeof Token>;

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>;

  @hasMany(() => Order, { foreignKey: 'deliveryManId' })
  declare deliveryOrders: HasMany<typeof Order>;


  @computed()
  get fullName(): string {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  }
}
