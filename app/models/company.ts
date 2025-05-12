// app/Models/Company.ts
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { Filterable } from 'adonis-lucid-filter'
import { DateTime } from 'luxon'

export default class Company extends compose(BaseModel, Filterable) {
  // Se você tiver um filtro para Company, descomente e aponte aqui:
  // static $filter = () => CompanyFilter

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare tenantId: string

  @column()
  declare name: string

  @column()
  declare cnpj: string

  @column()
  declare inscricaoEstadual?: string

  @column()
  declare email: string

  @column()
  declare phone?: string

  @column()
  declare street: string

  @column()
  declare number: string

  @column()
  declare complement?: string

  @column()
  declare neighborhood: string

  @column()
  declare city: string

  @column()
  declare state: string

  @column()
  declare zip: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
