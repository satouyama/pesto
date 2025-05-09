import PaymentMethod from '#models/payment_method';
import { BaseSeeder } from '@adonisjs/lucid/seeders';
import {
  paypalSupportedCountry,
  paypalSupportedCurrency,
  stripeSupportedCountry,
  stripeSupportedCurrency,
} from '../../app/utils/payment_method_data.js';

export default class extends BaseSeeder {
  async run() {
    await PaymentMethod.createMany([
      {
        key: 'paypal',
        name: 'Paypal',
        status: true,
        public: 'AZX7j1pULNFTPdwTTqlyE8QxOr8nIkcl-i-Abc6wNMG3UsoRfyFfnRD_GWJZkELTgIMyeTSItBNt5UwN',
        secret: 'EGl8Gf1jxcZVakbIeNGN-kA9cuKJfFAVb1cGbsAs8XI2M8RSqOaLxNVHs7HxC_v2yLRHRXP-GL-rtXgw',
        webhook: '1FK083318B6705748',
        countries: JSON.stringify(paypalSupportedCountry),
        currencies: JSON.stringify(paypalSupportedCurrency),
        mode: 'sandbox',
        config: JSON.stringify({
          fields: [
            { label: 'Client ID', name: 'public', required: true, type: 'text' },
            { label: 'Client Secret', name: 'secret', required: true, type: 'text' },
            { label: 'Webhook Id', name: 'webhook', required: true, type: 'text' },
            {
              label: 'Sandbox Mode',
              name: 'mode',
              required: true,
              type: 'radio_group',
              options: [
                {
                  label: 'Sandbox',
                  value: 'sandbox',
                },
                {
                  label: 'Live',
                  value: 'live',
                },
              ],
            },
          ],
        }),
      },
      {
        key: 'stripe',
        name: 'Stripe',
        status: true,
        public:
          'pk_test_51QQnVAJlHJAKjQLuoTo1zqpBvJnWk1feSue3NgutMcZBUJ8o03EKDIYwOKsT6iszJ1cpnUp2caRUvWQUB937aW6z00zyUuC8i3',
        secret:
          'sk_test_51QQnVAJlHJAKjQLutJpuKas2HqnmH7v73QT6N7RPvVRP2BHjA0z2NOxyUIwMyBPi6dzUrzhlXfwfzue4jo5T6tAo00luXvEtHR',
        webhook: 'whsec_M1IoI4RBjKKBCloOlKSYjsdPuVMApKKe',
        countries: JSON.stringify(stripeSupportedCountry),
        currencies: JSON.stringify(stripeSupportedCurrency),
        config: JSON.stringify({
          fields: [
            { label: 'Public Key', name: 'public', required: true, type: 'text' },
            { label: 'Secret Key', name: 'secret', required: true, type: 'text' },
            { label: 'Webhook Secret', name: 'webhook', required: true, type: 'text' },
          ],
        }),
      },
    ]);
  }
}
