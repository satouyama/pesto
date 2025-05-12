import Translation from '#models/translation'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import fs from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default class extends BaseSeeder {
  public async run() {
    const filePath = resolve(__dirname, './translation/pt.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { translations } = JSON.parse(fileContent)

    for (const item of translations) {
      await Translation.updateOrCreate(
        { key: item.key, code: item.code },
        {
          value: item.value,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }
      )
    }
  }
}
